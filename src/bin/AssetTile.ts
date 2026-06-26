class AssetTile {
    path: string;
    // True for road, false for grass
    up: boolean;
    right: boolean;
    down: boolean;
    left: boolean;
    probability: number;

    constructor(path: string, up: boolean, right: boolean, down: boolean, left: boolean, probability: number = 1) {
        this.path = path;
        this.up = up;
        this.right = right;
        this.down = down;
        this.left = left;
        this.probability = probability;
    }
}

export { AssetTile };