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
        let distance = 0;
        let tileType: TileType | null = null;

        let sensorX;
        let sensorY;
        do {
            distance += 1;
            sensorX = this.carX + Math.sin(sensorAngle) * distance;
            sensorY = this.carY - Math.cos(sensorAngle) * distance;
            tileType = this.getTileTypeFromPosition(sensorX, sensorY);
            if (tileType !== TileType.Road) {
                break;
            }

        }
        while (distance < 101);

        if (draw) {
            const screenX = (sensorX - this.camX) * this.camZoom + this.halfCanvasWidth;
            const screenY = (sensorY - this.camY) * this.camZoom + this.halfCanvasHeight;
            this.ctx.fillStyle = 'red';
            this.ctx.beginPath();
            this.ctx.arc(screenX, screenY, 5, 0, 2 * Math.PI);
            this.ctx.fill();

        }

        return (distance - 1) / 100;
    }

    private getTileTypeFromPosition(x: number, y: number): TileType | null {
        const screenX = (x - this.camX) * this.camZoom + this.halfCanvasWidth;
        const screenY = (y - this.camY) * this.camZoom + this.halfCanvasHeight;
        const pixel = this.ctx.getImageData(screenX, screenY, 1, 1).data;
        return this.getTileTypeFromColor([pixel[0]!, pixel[1]!, pixel[2]!]);
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