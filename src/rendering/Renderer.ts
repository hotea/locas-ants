import { Camera } from './Camera';
import { CONFIG } from '@/config';

export class Renderer {
  canvas: HTMLCanvasElement;
  ctx: CanvasRenderingContext2D;
  camera: Camera;

  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas;
    const ctx = canvas.getContext('2d');
    if (!ctx) throw new Error('Failed to get 2D context');
    this.ctx = ctx;
    this.camera = new Camera();

    this.resize();
    window.addEventListener('resize', () => this.resize());
  }

  resize(): void {
    this.canvas.width = window.innerWidth;
    this.canvas.height = window.innerHeight;
    this.camera.setScreenSize(this.canvas.width, this.canvas.height);
  }

  clear(): void {
    this.ctx.fillStyle = '#2d2d44';
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
  }

  beginWorldRender(): void {
    this.ctx.save();
    this.camera.applyTransform(this.ctx);
  }

  endWorldRender(): void {
    this.ctx.restore();
  }

  drawWorldBounds(): void {
    this.ctx.strokeStyle = '#4a4a6a';
    this.ctx.lineWidth = 2;
    this.ctx.strokeRect(0, 0, CONFIG.worldWidth, CONFIG.worldHeight);

    this.ctx.fillStyle = '#1a1a2e';
    this.ctx.fillRect(0, 0, CONFIG.worldWidth, CONFIG.worldHeight);
  }

  drawGrid(): void {
    const bounds = this.camera.getVisibleBounds();
    const size = CONFIG.gridSize;

    const startX = Math.floor(Math.max(0, bounds.left) / size) * size;
    const startY = Math.floor(Math.max(0, bounds.top) / size) * size;
    const endX = Math.min(CONFIG.worldWidth, bounds.right);
    const endY = Math.min(CONFIG.worldHeight, bounds.bottom);

    this.ctx.strokeStyle = '#252540';
    this.ctx.lineWidth = 0.5;
    this.ctx.beginPath();

    for (let x = startX; x <= endX; x += size) {
      this.ctx.moveTo(x, Math.max(0, bounds.top));
      this.ctx.lineTo(x, Math.min(CONFIG.worldHeight, bounds.bottom));
    }

    for (let y = startY; y <= endY; y += size) {
      this.ctx.moveTo(Math.max(0, bounds.left), y);
      this.ctx.lineTo(Math.min(CONFIG.worldWidth, bounds.right), y);
    }

    this.ctx.stroke();
  }

  get width(): number {
    return this.canvas.width;
  }

  get height(): number {
    return this.canvas.height;
  }
}
