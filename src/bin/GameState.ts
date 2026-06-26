import type { Camera } from "./Camera.js";
import type { Car } from "./Car.js";
import type { GameMap } from "./GameMap.js";

class GameState {
    private camX: number;
    private camY: number;
    private camZoom: number;

    private carX: number;
    private carY: number;
    private carAngle: number;

    private halfCanvasWidth: number;
    private halfCanvasHeight: number;

    private ctx: CanvasRenderingContext2D;
    private imageData: ImageData;

    frontSensor: number;
    frontLeftSensor: number;
    frontRightSensor: number;
    leftSensor: number;
    rightSensor: number;
    backSensor: number;

    constructor(map: GameMap, car: Car, camera: Camera, ctx: CanvasRenderingContext2D, canvas: HTMLCanvasElement) {
        this.camX = camera.x;
        this.camY = camera.y;
        this.camZoom = camera.zoom;

        this.carX = car.x;
        this.carY = car.y;
        this.carAngle = car.angle;

        this.halfCanvasWidth = canvas.width / 2;
        this.halfCanvasHeight = canvas.height / 2;

        this.ctx = ctx;
        this.imageData = this.ctx.getImageData(0, 0, this.ctx.canvas.width, this.ctx.canvas.height);

        this.frontSensor = this.getSensorValue(0, true);
        this.frontLeftSensor = this.getSensorValue(-Math.PI / 4, true);
        this.frontRightSensor = this.getSensorValue(Math.PI / 4, true);
        this.leftSensor = this.getSensorValue(-Math.PI / 2, true);
        this.rightSensor = this.getSensorValue(Math.PI / 2, true);
        this.backSensor = this.getSensorValue(Math.PI, true);
        console.log("Sensors:", this.frontSensor, this.leftSensor, this.rightSensor, this.backSensor);
    }

    private getSensorValue(angleOffset: number, draw: boolean = false): number {
        const sensorAngle = this.carAngle + angleOffset;
        const MAX_DISTANCE = 100;

        const step = Math.max(1, 1 / this.camZoom);

        let distance = 0;
        let tileType: TileType | null = null;
        let sensorX = this.carX;
        let sensorY = this.carY;
        const sinA = Math.sin(sensorAngle);
        const cosA = Math.cos(sensorAngle);

        while (distance < MAX_DISTANCE + 1) {
            distance += step;
            sensorX = this.carX + sinA * distance;
            sensorY = this.carY - cosA * distance;
            tileType = this.getTileTypeFromPosition(sensorX, sensorY);
            if (tileType !== TileType.Road) {
                break;
            }

        }

        if (draw) {
            const startScreenX = (this.carX - this.camX) * this.camZoom + this.halfCanvasWidth;
            const startScreenY = (this.carY - this.camY) * this.camZoom + this.halfCanvasHeight;
            const screenX = (sensorX - this.camX) * this.camZoom + this.halfCanvasWidth;
            const screenY = (sensorY - this.camY) * this.camZoom + this.halfCanvasHeight;
            this.ctx.fillStyle = 'red';
            this.ctx.strokeStyle = 'green';
            this.ctx.lineWidth = this.camZoom;
            this.ctx.beginPath();
            this.ctx.moveTo(startScreenX, startScreenY);
            this.ctx.lineTo(screenX, screenY);
            this.ctx.stroke();
            this.ctx.beginPath();
            this.ctx.arc(screenX, screenY, 4 * this.camZoom, 0, 2 * Math.PI);
            this.ctx.fill();
        }

        return (distance - 1) / MAX_DISTANCE;
    }

    private getTileTypeFromPosition(x: number, y: number): TileType | null {
        const screenX = Math.round((x - this.camX) * this.camZoom + this.halfCanvasWidth);
        const screenY = Math.round((y - this.camY) * this.camZoom + this.halfCanvasHeight);

        // Bounds check
        if (screenX < 0 || screenY < 0 || screenX >= this.imageData.width || screenY >= this.imageData.height) {
            return null;
        }

        const index = (screenY * this.imageData.width + screenX) * 4;
        const d = this.imageData.data;
        return this.getTileTypeFromColor([d[index]!, d[index + 1]!, d[index + 2]!]);
    }

    private getTileTypeFromColor(color: [number, number, number]): TileType | null {
        if (color[0] === 0 && color[1] === 0 && color[2] === 0) {
            return null;
        }
        if (color[1] > color[0] + color[2]) {
            return TileType.Grass;
        }
        return TileType.Road;
    }
}

enum TileType {
    Road,
    Grass,
}

function componentToHex(c: number): string {
    var hex = c.toString(16);
    return hex.length == 1 ? "0" + hex : hex;
}

function rgbToHex(r: number, g: number, b: number): string {
    return "#" + componentToHex(r) + componentToHex(g) + componentToHex(b);
}

export { GameState };