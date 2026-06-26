import type { Camera } from "./Camera.js";
import type { Car } from "./Car.js";
import type { GameMap } from "./GameMap.js";

const drawLine: boolean = false;
const drawCircle: boolean = true;
const TILE_SIZE: number = 64;

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
    private map: GameMap;

    frontSensor: number = 0;
    frontLeftSensor: number = 0;
    frontRightSensor: number = 0;
    leftSensor: number = 0;
    rightSensor: number = 0;
    backSensor: number = 0;

    constructor(canvas: HTMLCanvasElement, ctx: CanvasRenderingContext2D, map: GameMap) {
        this.halfCanvasWidth = canvas.width / 2;
        this.halfCanvasHeight = canvas.height / 2;

        this.ctx = ctx;
        this.map = map;
    }

    update(car: Car, camera: Camera) {
        this.camX = camera.x;
        this.camY = camera.y;
        this.camZoom = camera.zoom;

        this.carX = car.x;
        this.carY = car.y;
        this.carAngle = car.angle;

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
        let sensorX = this.carX;
        let sensorY = this.carY;
        const sinA = Math.sin(sensorAngle);
        const cosA = Math.cos(sensorAngle);

        while (distance < MAX_DISTANCE + 1) {
            distance += step;
            sensorX = this.carX + sinA * distance;
            sensorY = this.carY - cosA * distance;
            if (this.isRoadAt(sensorX, sensorY)) {
                break;
            }
        }

        if (drawCircle || drawLine) {
            const startScreenX = (this.carX - this.camX) * this.camZoom + this.halfCanvasWidth;
            const startScreenY = (this.carY - this.camY) * this.camZoom + this.halfCanvasHeight;
            const screenX = (sensorX - this.camX) * this.camZoom + this.halfCanvasWidth;
            const screenY = (sensorY - this.camY) * this.camZoom + this.halfCanvasHeight;
            this.ctx.fillStyle = 'green';
            if (drawLine) {
                this.ctx.strokeStyle = 'red';
                this.ctx.lineWidth = this.camZoom;
                this.ctx.beginPath();
                this.ctx.moveTo(startScreenX, startScreenY);
                this.ctx.lineTo(screenX, screenY);
                this.ctx.stroke();
            } if (drawCircle) {
                this.ctx.beginPath();
                this.ctx.arc(screenX, screenY, 4 * this.camZoom, 0, 2 * Math.PI);
                this.ctx.fill();
            }
        }

        return (distance - 1) / MAX_DISTANCE;
    }

    private isRoadAt(worldX: number, worldY: number): boolean {
        const tileX = Math.floor(worldX / TILE_SIZE);
        const tileY = Math.floor(worldY / TILE_SIZE);

        const localX = (Math.floor(worldX % TILE_SIZE) + TILE_SIZE) % TILE_SIZE;
        const localY = (Math.floor(worldY % TILE_SIZE) + TILE_SIZE) % TILE_SIZE;
        const i = localY * TILE_SIZE + localX;
        const mask = this.map.getRoadMaskAt(tileX, tileY);
        if (!mask) {
            console.warn(`No road mask found for tile at (${tileX}, ${tileY})`);
            return false;
        }
        return ((mask![i >> 3]! >> (7 - (i & 7))) & 1) === 1;
        // const point = mask[localY * TILE_SIZE + localX];
        // if (point === undefined) {
        //     console.warn(`No point found in road mask for local coordinates (${localX}, ${localY}) in tile at (${tileX}, ${tileY})`);
        //     return false;
        // }
        // return mask[localY * TILE_SIZE + localX] === 1;
    }
}

export { GameState };