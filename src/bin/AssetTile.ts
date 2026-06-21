import { TileType } from "./TileType.js";

class AssetTile {
    path: string;
    up: TileType;
    right: TileType;
    down: TileType;
    left: TileType;
    probability: number;

    constructor(path: string, up: TileType,right: TileType, down: TileType, left: TileType, probability: number = 1) {
        this.path = path;
        this.up = up;
        this.right = right;
        this.down = down;
        this.left = left;
        this.probability = probability;
    }
}

export { AssetTile };