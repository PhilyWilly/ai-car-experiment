import { Camera } from "./Camera.js";
import { GameMap } from "./GameMap.js";
import { Car } from "./Car.js";

const maxZoom: number = 4;
const minZoom: number = 0.3;

class Game {
    canvas: HTMLCanvasElement;
    ctx: CanvasRenderingContext2D;
    
    camera: Camera = new Camera(0, 0, 1);
    map: GameMap;
    car: Car[];

    drag: boolean = false;
    oldCameraVersion: number = -1;

    constructor() {
        console.log("Game started");
        this.canvas = document.getElementById('game-canvas') as HTMLCanvasElement;
        this.ctx = this.canvas.getContext("2d")!;

        this.car = [new Car(this.canvas, this.ctx, this.camera)];
        this.map = new GameMap(this.canvas, this.ctx, this.camera);
        this.canvas.addEventListener("mousedown", (event) => {
            this.drag = true;
        }); 
        this.canvas.addEventListener("mouseup", (event) => {
            this.drag = false;
        }); 
        document.addEventListener("keydown", (event) => {
            switch  (event.key) {
                case "ArrowUp":
                case "w":
                    this.car[0]!.acceleration = 0.5;
                    break;
                case "ArrowDown":
                case "s":
                    this.car[0]!.acceleration = -0.5;
                    break;
                case "ArrowLeft":
                case "a":
                    this.car[0]!.steering = -0.05;
                    break;
                case "ArrowRight":
                case "d":
                    this.car[0]!.steering = 0.05;
                    break;
            }
        });
        document.addEventListener("keyup", (event) => {
            switch  (event.key) {
                case "ArrowUp":
                case "ArrowDown":
                case "w":
                case "s":
                    this.car[0]!.acceleration = 0;
                    break;
                case "ArrowLeft":
                case "ArrowRight":
                case "a":
                case "d":
                    this.car[0]!.steering = 0;
                    break;
            }
        });
        this.canvas.addEventListener("mousemove", (event) => {
            if (this.drag) {
                this.camera.moveBy(-event.movementX * 1/this.camera.zoom, -event.movementY * 1/this.camera.zoom);
            }
        });
        this.canvas.addEventListener("wheel", (event) => {
            event.preventDefault();
            const zoomAmount = -event.deltaY * 0.001 * this.camera.zoom;
            const clampedZoom = Math.min(maxZoom, Math.max(minZoom, this.camera.zoom + zoomAmount));
            this.camera.setZoom(clampedZoom);
        });

        this.startGameLoop();
    }

    startGameLoop() {
        const fps = 20;
        const interval = 1000 / fps;
        this.map.drawState();
        setInterval(() => { 
            this.car.forEach((c) => {
                c.gameTick();
                this.map.generateTiles(c.x, c.y); // Generate tiles around the car's position, even when not visible
            });
            // this.car[0]!.centerCamera();
            if (this.oldCameraVersion != this.camera.version) {
                this.oldCameraVersion = this.camera.version;
                this.map.drawState(); 
                this.car.forEach((c) => c.drawCar());
            }
        }, interval);
    }
}

export { Game };