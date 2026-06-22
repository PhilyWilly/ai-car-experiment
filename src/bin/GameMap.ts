import { assetTiles, getRandomAssetTile } from "../lib/asset_tiles.js";
import type { AssetTile } from "./AssetTile.js";
import type { Camera } from "./Camera.js";
import type { TileType } from "./TileType.js";

const tileSize: number = 64;

class GameMap {
    canvas: HTMLCanvasElement;
    ctx: CanvasRenderingContext2D;
    
    camera: Camera;
    
    state: AssetTile[][];
    private cache: Map<string, HTMLImageElement> = new Map();

    constructor(canvas: HTMLCanvasElement, ctx: CanvasRenderingContext2D, camera: Camera) {
        this.canvas = canvas;
        this.ctx = ctx;
        this.camera = camera;

        this.state = [[assetTiles[9]!]];
        this.loadAssets();
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

    private loadAsset(path: string) {
        if (!this.cache.has(path)) {
            const img = new Image();
            img.src = "assets/tiles/" + path;
            this.cache.set(path, img);
        }
    }

    private generateTile(x: number, y: number): AssetTile | null {
        const topTile = this.state[y - 1]?.[x];
        const rightTile = this.state[y]?.[x + 1];
        const bottomTile = this.state[y + 1]?.[x];
        const leftTile = this.state[y]?.[x - 1];
        const requiredUp = topTile ? topTile.down : null;
        const requiredRight = rightTile ? rightTile.left : null;
        const requiredDown = bottomTile ? bottomTile.up : null;
        const requiredLeft = leftTile ? leftTile.right : null;
        if (requiredUp === null && requiredRight === null && requiredDown === null && requiredLeft === null) {
            return null;
        }

        return getRandomAssetTile(requiredUp, requiredRight, requiredDown, requiredLeft);
    }

    verifyTile(tile: AssetTile, requiredUp: TileType | null, requiredRight: TileType | null, requiredDown: TileType | null, requiredLeft: TileType | null) {
        if (requiredUp !== null && tile.up !== requiredUp) {
            return false;
        }
        if (requiredRight !== null && tile.right !== requiredRight) {
            return false;
        }
        if (requiredDown !== null && tile.down !== requiredDown) {
            return false;
        }
        if (requiredLeft !== null && tile.left !== requiredLeft) {
            return false;
        }
        return true;
    }

    private drawTile(x: number, y: number) {
        if (this.state[y] === undefined) {
            this.state[y] = [];
        }
        if (this.state[y]![x] === undefined) {
            const generatedTile = this.generateTile(x, y);
            if (generatedTile === null) {
                return;
            }
            this.state[y]![x] = generatedTile;
        }
        const tile = this.state[y]![x];
        const img = this.cache.get(tile!.path);
        if (!img) {
            this.loadAsset(tile!.path);
            this.camera.update();
            return;
        }
        const screenX = (x * tileSize - this.camera.x) * this.camera.zoom + this.canvas.width / 2;
        const screenY = (y * tileSize - this.camera.y) * this.camera.zoom + this.canvas.height / 2;
        const size = tileSize * this.camera.zoom;
        this.ctx.drawImage(img, screenX, screenY, size, size);
    }

    drawState() {
        // console.log("Drawing map");
        
        const viewPort = this.camera.getViewPort(tileSize, this.canvas.width, this.canvas.height);
        const top = viewPort.top;
        const right = viewPort.right;
        const bottom = viewPort.bottom;
        const left = viewPort.left;

        const verRadius = Math.ceil(this.canvas.height / (tileSize * this.camera.zoom * 2)) + 1;
        const horRadius = Math.ceil(this.canvas.width / (tileSize * this.camera.zoom * 2)) + 1;
        const maxRadius = verRadius + horRadius ;
        const centerX = Math.floor(this.camera.x / tileSize);
        const centerY = Math.floor(this.camera.y / tileSize);

        this.drawTile(centerX, centerY);

        for (let radius = 1; radius < maxRadius; radius++) {
            for (let i = 0; i < radius*4; i++) {
                const div = Math.floor(i/(radius));
                const x = Math.abs(i-radius*2)-radius + centerX;
                const y = Math.abs((i+radius)%(radius*4)-radius*2)-radius + centerY;
                this.drawTile(x, y);
            }
        }
    }
}

export { GameMap };