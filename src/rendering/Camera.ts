import { Vector2 } from '@/utils/Vector2';
import { clamp } from '@/utils/MathUtils';

export class Camera {
  position: Vector2 = new Vector2(0, 0);
  zoom: number = 1;
  minZoom: number = 0.25;
  maxZoom: number = 4;

  private screenWidth: number = 0;
  private screenHeight: number = 0;

  setScreenSize(width: number, height: number): void {
    this.screenWidth = width;
    this.screenHeight = height;
  }

  screenToWorld(screenX: number, screenY: number): Vector2 {
    return new Vector2(
      (screenX - this.screenWidth / 2) / this.zoom + this.position.x,
      (screenY - this.screenHeight / 2) / this.zoom + this.position.y
    );
  }

  worldToScreen(worldX: number, worldY: number): Vector2 {
    return new Vector2(
      (worldX - this.position.x) * this.zoom + this.screenWidth / 2,
      (worldY - this.position.y) * this.zoom + this.screenHeight / 2
    );
  }

  pan(dx: number, dy: number): void {
    this.position.x -= dx / this.zoom;
    this.position.y -= dy / this.zoom;
  }

  zoomAt(screenX: number, screenY: number, delta: number): void {
    const worldBefore = this.screenToWorld(screenX, screenY);

    const zoomFactor = delta > 0 ? 0.9 : 1.1;
    this.zoom = clamp(this.zoom * zoomFactor, this.minZoom, this.maxZoom);

    const worldAfter = this.screenToWorld(screenX, screenY);

    this.position.x += worldBefore.x - worldAfter.x;
    this.position.y += worldBefore.y - worldAfter.y;
  }

  getVisibleBounds(): { left: number; top: number; right: number; bottom: number } {
    const halfWidth = this.screenWidth / 2 / this.zoom;
    const halfHeight = this.screenHeight / 2 / this.zoom;

    return {
      left: this.position.x - halfWidth,
      top: this.position.y - halfHeight,
      right: this.position.x + halfWidth,
      bottom: this.position.y + halfHeight,
    };
  }

  applyTransform(ctx: CanvasRenderingContext2D): void {
    ctx.translate(this.screenWidth / 2, this.screenHeight / 2);
    ctx.scale(this.zoom, this.zoom);
    ctx.translate(-this.position.x, -this.position.y);
  }
}
