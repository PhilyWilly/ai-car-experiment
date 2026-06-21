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
}

export { Camera };