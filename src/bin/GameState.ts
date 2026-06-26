import type { Camera } from "./Camera.js";
import type { Car } from "./Car.js";

const drawLine: boolean = true;
const drawCircle: boolean = true;

class GameState {
    private camX: number | null = null;
    private camY: number | null = null;
    private camZoom: number | null = null;

    private carX: number | null = null;
    private carY: number | null = null;
    private carAngle: number | null = null;

    private halfCanvasWidth: number;
    private halfCanvasHeight: number;

    private ctx: CanvasRenderingContext2D;
    private imageData: ImageData | null = null;

    private frontSensor: number | null = null;
    private frontLeftSensor: number | null = null;
    private frontRightSensor: number | null = null;
    private leftSensor: number | null = null;
    private rightSensor: number | null = null;
    private backSensor: number | null = null;

    constructor(ctx: CanvasRenderingContext2D, canvas: HTMLCanvasElement) {
        this.halfCanvasWidth = canvas.width / 2;
        this.halfCanvasHeight = canvas.height / 2;

        this.ctx = ctx;
    }

    update(car: Car, camera: Camera) {
        this.camX = camera.x;
        this.camY = camera.y;
        this.camZoom = camera.zoom;

        this.carX = car.x;
        this.carY = car.y;
        this.carAngle = car.angle;

        this.imageData = this.ctx.getImageData(0, 0, this.ctx.canvas.width, this.ctx.canvas.height);


        this.frontSensor = this.getSensorValue(0);
        this.frontLeftSensor = this.getSensorValue(-20 * Math.PI / 180);
        this.frontRightSensor = this.getSensorValue(20 * Math.PI / 180);
        this.leftSensor = this.getSensorValue(-60 * Math.PI / 180);
        this.rightSensor = this.getSensorValue(60 * Math.PI / 180);
        this.backSensor = this.getSensorValue(Math.PI);
        console.log("Sensors:", this.frontSensor, this.frontLeftSensor, this.frontRightSensor, this.leftSensor, this.rightSensor, this.backSensor);
    }

    resize(canvas: HTMLCanvasElement) {
        this.halfCanvasWidth = canvas.width / 2;
        this.halfCanvasHeight = canvas.height / 2;
    }

    private getSensorValue(angleOffset: number): number {
        if (this.camX === null || this.camY === null || this.camZoom === null || this.carX === null || this.carY === null || this.carAngle === null) {
            throw new Error("Camera or car state is not initialized");
        }
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

        if (drawCircle || drawLine) {
            const startScreenX = (this.carX - this.camX) * this.camZoom + this.halfCanvasWidth;
            const startScreenY = (this.carY - this.camY) * this.camZoom + this.halfCanvasHeight;
            const screenX = (sensorX - this.camX) * this.camZoom + this.halfCanvasWidth;
            const screenY = (sensorY - this.camY) * this.camZoom + this.halfCanvasHeight;
            this.ctx.fillStyle = 'red';
            if (drawLine) {
                this.ctx.strokeStyle = 'green';
                this.ctx.lineWidth = this.camZoom;
                this.ctx.beginPath();
                this.ctx.moveTo(startScreenX, startScreenY);
                this.ctx.lineTo(screenX, screenY);
                this.ctx.stroke();
            } if (drawCircle) {
                this.ctx.beginPath();
                this.ctx.arc(startScreenX, startScreenY, 4 * this.camZoom, 0, 2 * Math.PI);
                this.ctx.fill();

                this.ctx.beginPath();
                this.ctx.arc(screenX, screenY, 4 * this.camZoom, 0, 2 * Math.PI);
                this.ctx.fill();
            }
        }

        return (distance - 1) / MAX_DISTANCE;
    }

    private getTileTypeFromPosition(x: number, y: number): TileType | null {
        if (this.camX === null || this.camY === null || this.camZoom === null || this.imageData === null) {
            throw new Error("Game state is not initialized");
        }
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

export { GameState };