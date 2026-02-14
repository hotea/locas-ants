import { Cell, CellType } from './Cell';
import { Vector2 } from '@/utils/Vector2';
import { CONFIG } from '@/config';

export class Portal extends Cell {
  type: CellType = 'portal';
  linkedPortal: Portal | null = null;
  color: string;

  private static colors = ['#ff6b6b', '#4ecdc4', '#ffe66d', '#95e1d3', '#f38181'];
  private static colorIndex = 0;

  constructor(position: Vector2, color?: string) {
    super(position);
    this.color = color ?? Portal.colors[Portal.colorIndex++ % Portal.colors.length];
  }

  link(other: Portal): void {
    this.linkedPortal = other;
    other.linkedPortal = this;
    other.color = this.color;
  }

  teleport(_position: Vector2): Vector2 | null {
    if (!this.linkedPortal?.gridCell) return null;

    return new Vector2(
      this.linkedPortal.gridCell.centerX,
      this.linkedPortal.gridCell.centerY
    );
  }

  render(ctx: CanvasRenderingContext2D): void {
    if (!this.gridCell) return;

    const size = CONFIG.gridSize;
    const x = this.gridCell.worldX;
    const y = this.gridCell.worldY;

    // 确保圆心在世界边界内
    const centerX = Math.min(x + size / 2, CONFIG.worldWidth);
    const centerY = Math.min(y + size / 2, CONFIG.worldHeight);

    // 只有当圆心在边界内时才渲染
    if (centerX <= CONFIG.worldWidth && centerY <= CONFIG.worldHeight) {
      ctx.fillStyle = this.color;
      ctx.globalAlpha = 0.7;
      ctx.beginPath();
      ctx.arc(centerX, centerY, size / 2 - 2, 0, Math.PI * 2);
      ctx.fill();
      ctx.globalAlpha = 1;

      if (this.linkedPortal) {
        ctx.strokeStyle = '#fff';
        ctx.lineWidth = 1;
        ctx.stroke();
      }
    }
  }
}
