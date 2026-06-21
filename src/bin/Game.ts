import { TileType } from "./TileType.js";
import { AssetTile } from "./AssetTile.js";
import { Camera } from "./Camera.js";
import { assetTiles } from "../lib/asset_tiles.js";

const imageSize: number = 64;

class Game {
    canvas: HTMLCanvasElement;
    ctx: CanvasRenderingContext2D;

    state: AssetTile[][];
    camera: Camera;


    constructor() {
        console.log("Game started");
        this.canvas = document.getElementById('game-canvas') as HTMLCanvasElement;
        this.ctx = this.canvas.getContext("2d")!;

        this.state = [[assetTiles()[0]!, assetTiles()[1]!, assetTiles()[2]!, assetTiles()[3]!, assetTiles()[4]!, assetTiles()[5]!],
                      [assetTiles()[0]!, assetTiles()[1]!, assetTiles()[2]!, assetTiles()[3]!, assetTiles()[4]!, assetTiles()[5]!],
                      [assetTiles()[0]!, assetTiles()[1]!, assetTiles()[2]!, assetTiles()[3]!, assetTiles()[4]!, assetTiles()[5]!],
                      [assetTiles()[0]!, assetTiles()[1]!, assetTiles()[2]!, assetTiles()[3]!, assetTiles()[4]!, assetTiles()[5]!],
                      [assetTiles()[0]!, assetTiles()[1]!, assetTiles()[2]!, assetTiles()[3]!, assetTiles()[4]!, assetTiles()[5]!],
                      [assetTiles()[0]!, assetTiles()[1]!, assetTiles()[2]!, assetTiles()[3]!,(assetTiles())[4]!,assetTiles()[5]!]];
        this.camera = new Camera(0, 0, 1);

        

        this.drawState();
        this.startGameLoop();
    }

    startGameLoop() {
        const fps = 1;
        const interval = 1000 / fps;
        setInterval(() => this.drawState(), interval);
    }

    drawState() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        for (let y = 0; y < this.state.length; y++) {
            for (let x = 0; x < this.state[y]!.length; x++) {
                const tile = this.state[y]![x];
                const img = new Image();
                img.onload = () => {
                    const screenX = (x * imageSize - this.camera.x) * this.camera.zoom;
                    const screenY = (y * imageSize - this.camera.y) * this.camera.zoom;
                    const size = imageSize * this.camera.zoom;
                    this.ctx.drawImage(img, screenX, screenY, size, size);
                };
                img.src = "assets/tiles/" + tile!.path;
            }
        }
    }
}

export { Game };