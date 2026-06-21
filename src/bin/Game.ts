import { TileType } from "./TileType.js";
import { AssetTile } from "./AssetTile.js";
import { Camera } from "./Camera.js";
import { assetTiles } from "../lib/asset_tiles.js";

const tileSize: number = 64;

const maxZoom: number = 4;
const minZoom: number = 0.25;

class Game {
    canvas: HTMLCanvasElement;
    ctx: CanvasRenderingContext2D;

    state: AssetTile[][];
    private cache: Map<string, HTMLImageElement> = new Map();
    camera: Camera;
    drag: boolean = false;


    constructor() {
        console.log("Game started");
        this.canvas = document.getElementById('game-canvas') as HTMLCanvasElement;
        this.ctx = this.canvas.getContext("2d")!;

        this.state = [[assetTiles()[0]!]];
        this.camera = new Camera(0, 0, 1);
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

        this.loadAssets();
        this.startGameLoop();
    }

    private loadAssets() {
        for (const row of this.state) {
            for (const tile of row) {
                if (!this.cache.has(tile!.path)) {
                    const img = new Image();
                    img.src = "assets/tiles/" + tile!.path;
                    this.cache.set(tile!.path, img);
                }
            }
        }
    }

    startGameLoop() {
        const fps = 20;
        const interval = 1000 / fps;
        setInterval(() => this.drawState(), interval);
    }

    private generateTile(x: number, y: number): AssetTile {
        const tile = assetTiles()[Math.floor(Math.random() * assetTiles().length)]!;
        return tile;
    }

    drawState() {
        const viewPort = this.camera.getViewPort(tileSize, this.canvas.width, this.canvas.height);
        const top = viewPort.top;
        const right = viewPort.right;
        const bottom = viewPort.bottom;
        const left = viewPort.left;

        for (let y = top; y < bottom; y++) {
            if (this.state[y] === undefined) {
                this.state[y] = [];
            }
            for (let x = left; x < right; x++) {
                if (this.state[y]![x] === undefined) {
                    this.state[y]![x] = this.generateTile(x, y);
                }
                const tile = this.state[y]![x];
                const img = this.cache.get(tile!.path);
                if (!img) {
                    this.loadAssets();
                    continue;
                }
                const screenX = (x * tileSize - this.camera.x) * this.camera.zoom + this.canvas.width / 2;
                const screenY = (y * tileSize - this.camera.y) * this.camera.zoom + this.canvas.height / 2;
                const size = tileSize * this.camera.zoom;
                this.ctx.drawImage(img, screenX, screenY, size, size);
            }
        }
    }
}

export { Game };