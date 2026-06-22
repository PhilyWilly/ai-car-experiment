import { Camera } from "./Camera.js";
import { GameMap } from "./GameMap.js";

const maxZoom: number = 4;
const minZoom: number = 0.3;

class Game {
    canvas: HTMLCanvasElement;
    ctx: CanvasRenderingContext2D;
    
    camera: Camera;
    map: GameMap;
    drag: boolean = false;


    constructor() {
        console.log("Game started");
        this.canvas = document.getElementById('game-canvas') as HTMLCanvasElement;
        this.ctx = this.canvas.getContext("2d")!;

        this.camera = new Camera(0, 0, 1);
        this.map = new GameMap(this.canvas, this.ctx, this.camera);
        this.canvas.addEventListener("mousedown", (event) => {
            this.drag = true;
        }); 
        this.canvas.addEventListener("mouseup", (event) => {
            this.drag = false;
        }); 
        this.canvas.addEventListener("mousemove", (event) => {
            if (this.drag) {
                this.camera.move(-event.movementX * 1/this.camera.zoom, -event.movementY * 1/this.camera.zoom);
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
        setInterval(() => this.map.drawState(), interval);
    }
}

export { Game };