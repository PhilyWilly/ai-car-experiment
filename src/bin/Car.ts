import type { Camera } from "./Camera.js";

const tileSize: number = 64;
const carSize: number = 0.2;
const stopMovingThreshold: number = 0.05;

class Car {
    canvas: HTMLCanvasElement;
    ctx: CanvasRenderingContext2D;
    camera: Camera;

    image: HTMLImageElement;

    x: number = tileSize / 2;
    y: number = tileSize / 2;
    angle: number = 0;

    velocity: number = 0;
    acceleration: number = 0;
    steering: number = 0;

    constructor(canvas: HTMLCanvasElement, ctx: CanvasRenderingContext2D, camera: Camera) {
        this.canvas = canvas;
        this.ctx = ctx;
        this.camera = camera;

        this.image = new Image();
        this.image.src = "assets/cars/car_black_1.png";
    }

    gameTick() {
        this.velocity += this.acceleration;
        if (this.velocity == 0) return;
        this.velocity *= 0.95; // Friction
        this.angle += this.steering * (this.velocity * 0.5) * (1 / Math.max(1, this.velocity*0.3)) * 1.5 ; 
        const deltaX = this.velocity * Math.sin(this.angle);
        const deltaY = this.velocity * -Math.cos(this.angle);
        if (deltaX < stopMovingThreshold 
            && deltaX > -stopMovingThreshold 
            && deltaY < stopMovingThreshold 
            && deltaY > -stopMovingThreshold
        ) this.velocity = 0;
        this.x += this.velocity * Math.sin(this.angle);
        this.y += this.velocity * -Math.cos(this.angle);
        this.camera.update();
    }

    centerCamera() {
        this.camera.moveTo(this.x, this.y);
    }

    drawCar() {
        const carWidth = 71 * this.camera.zoom * carSize;
        const carHeight = 131 * this.camera.zoom * carSize;
        const screenX = (this.x - this.camera.x) * this.camera.zoom + this.canvas.width / 2;
        const screenY = (this.y - this.camera.y) * this.camera.zoom + this.canvas.height / 2;

        this.ctx.save();                         
        this.ctx.translate(screenX, screenY);     
        this.ctx.rotate(this.angle);            
        this.ctx.drawImage(                     
            this.image,
            -carWidth / 2,
            -carHeight / 2,
            carWidth,
            carHeight
        );
        this.ctx.restore();
    }
}

export { Car };