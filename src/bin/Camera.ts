class Camera {
    x: number;
    y: number;
    zoom: number;
    version: number = 0;

    constructor(x: number, y: number, zoom: number) {
        this.x = x;
        this.y = y;
        this.zoom = zoom;
    }

    moveBy(dx: number, dy: number) {
        if (dx == 0 && dy == 0) return;
        this.x += dx;
        this.y += dy;
        this.version++;
    }

    moveTo(dx: number, dy: number) {
        if (this.x == dx && this.y == dy) return;
        this.x = dx;
        this.y = dy;
        this.version++;
    }

    setZoom(zoom: number) {
        if (zoom == this.zoom) return;
        this.zoom = zoom;
        this.version++;
    }

    getViewPort(tileSize: number, canvasWidth: number, canvasHeight: number) {
        const top = Math.floor((this.y - canvasHeight / (2 * this.zoom)) / tileSize + 1) - 1;
        const right = Math.floor((this.x + canvasWidth / (2 * this.zoom)) / tileSize + 1);
        const bottom = Math.floor((this.y + canvasHeight / (2*this.zoom)) / tileSize + 1);
        const left = Math.floor((this.x - canvasWidth / (2 * this.zoom)) / tileSize + 1) - 1;
        return { top, right, bottom, left };
    }

    update() {
        this.version++;
    }
}

export { Camera };