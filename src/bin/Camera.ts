class Camera {
    x: number;
    y: number;
    zoom: number;

    constructor(x: number, y: number, zoom: number) {
        this.x = x;
        this.y = y;
        this.zoom = zoom;
    }

    move(dx: number, dy: number) {
        this.x += dx;
        this.y += dy;
    }

    setZoom(zoom: number) {
        this.zoom = zoom;
    }

    getViewPort(tileSize: number, canvasWidth: number, canvasHeight: number) {
        const left = Math.floor((this.x - canvasWidth / (2 * this.zoom)) / tileSize + 1);
        const right = Math.floor((left + canvasWidth / this.zoom) / tileSize + 1);
        const top = Math.floor((this.y - canvasHeight / (2 * this.zoom)) / tileSize + 1);
        const bottom = Math.floor((top + canvasHeight / this.zoom) / tileSize + 1);
        return { top, right, bottom, left };
    }
}

export { Camera };