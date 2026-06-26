import { assetTiles, getRandomAssetTile } from "../lib/asset_tiles.js";
import type { AssetTile } from "./AssetTile.js";
import type { Camera } from "./Camera.js";
import type { TileType } from "./TileType.js";

const tileSize: number = 64;

class GameMap {
    canvas: HTMLCanvasElement;
    ctx: CanvasRenderingContext2D;

    camera: Camera;

    state: (AssetTile | null)[][];
    generatedTiles: number = 0;
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

    private generateTile(x: number, y: number): AssetTile {
        this.generatedTiles++;
        // console.log("Generating tile at", x, y, "Total generated:", this.generatedTiles);
        const topTile = this.state[y - 1]?.[x];
        const rightTile = this.state[y]?.[x + 1];
        const bottomTile = this.state[y + 1]?.[x];
        const leftTile = this.state[y]?.[x - 1];

        const requiredUp = topTile ? topTile.down : null;
        const requiredRight = rightTile ? rightTile.left : null;
        const requiredDown = bottomTile ? bottomTile.up : null;
        const requiredLeft = leftTile ? leftTile.right : null;

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
        if (this.state[y] == undefined || this.state[y]![x] == undefined) return;
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

    replaceTiles(centerX: number, centerY: number, centerRadius: number) {
        let error: boolean = false;
        do {
            error = false;
            for (let x = centerX - centerRadius; x <= centerX + centerRadius; x++) {
                for (let y = centerY - centerRadius; y <= centerY + centerRadius; y++) {
                    if (this.state[y] === undefined) {
                        this.state[y] = [];
                    }
                    this.state[y]![x] = null;
                }
            }
            for (let x = centerX - centerRadius; x <= centerX + centerRadius; x++) {
                for (let y = centerY - centerRadius; y <= centerY + centerRadius; y++) {
                    try {
                        this.state[y]![x] = this.generateTile(x, y);
                        console.log("Replaced tile at", x, y, "with", this.state[y]![x]!.path);
                    }
                    catch (e) {
                        if (e instanceof RangeError) {
                            error = true;
                            break;
                        }
                        else {
                            throw e;
                        }
                    }
                }
            }
        } while (error);
        console.log("Replaced tiles around", centerX, centerY, "with radius", centerRadius);
    }

    generateTiles(x: number, y: number, zoom: number = 1) {
        const generateFromMiddle = false;
        let maxRadius: number;
        let centerX: number;
        let centerY: number;
        if (generateFromMiddle) {
            const verRadius = Math.ceil((Math.ceil(this.canvas.height * (1 / Math.sqrt(zoom))) + Math.abs(y)) / (tileSize));
            const horRadius = Math.ceil((Math.ceil(this.canvas.width * (1 / Math.sqrt(zoom))) + Math.abs(x)) / (tileSize));

            maxRadius = verRadius + horRadius;
            centerX = 0;
            centerY = 0;
        }
        else {
            const verRadius = Math.ceil(this.canvas.height / (tileSize * zoom * 2)) + 1;
            const horRadius = Math.ceil(this.canvas.width / (tileSize * zoom * 2)) + 1;
            maxRadius = verRadius + horRadius;
            centerX = Math.floor(x / tileSize);
            centerY = Math.floor(y / tileSize);
        }

        for (let radius = 1; radius < maxRadius; radius++) {
            for (let i = 0; i < radius * 4; i++) {
                // Get the y and x coordinates of the tile to generate based on the radius and the index
                const x = Math.abs(i - radius * 2) - radius + centerX;
                const y = Math.abs((i + radius) % (radius * 4) - radius * 2) - radius + centerY;

                if (this.state[y] == undefined) {
                    this.state[y] = [];
                }
                if (this.state[y]![x] === undefined) {
                    try {
                        this.state[y]![x] = this.generateTile(x, y);
                    }
                    catch (e) {
                        if (e instanceof RangeError) {
                            console.warn("No eligible tiles found for the given constraints. Replacing surrounding tiles and trying again.");
                            this.replaceTiles(x, y, 2);
                        }
                        else {
                            throw e;
                        }
                    }
                }
            }
        }
    }


    drawState() {
        // console.log("Drawing map");
        this.generateTiles(this.camera.x, this.camera.y, this.camera.zoom);

        const viewPort = this.camera.getViewPort(tileSize, this.canvas.width, this.canvas.height);
        const top = viewPort.top;
        const right = viewPort.right;
        const bottom = viewPort.bottom;
        const left = viewPort.left;

        for (let y = top; y < bottom; y++) {
            for (let x = left; x < right; x++) {
                this.drawTile(x, y);
            }
        }
    }
}

export { GameMap };