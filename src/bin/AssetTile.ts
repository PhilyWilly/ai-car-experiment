import { TileType } from "./TileType.js";

class AssetTile {
    path: string;
    up: TileType;
    right: TileType;
    down: TileType;
    left: TileType;

    constructor(path: string, up: TileType,right: TileType, down: TileType, left: TileType) {
        this.path = path;
        this.up = up;
        this.right = right;
        this.down = down;
        this.left = left;
    }
}

export { AssetTile };