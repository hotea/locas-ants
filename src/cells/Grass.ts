import { Cell, CellType } from './Cell';
import { Vector2 } from '@/utils/Vector2';
import { CONFIG } from '@/config';

export class Grass extends Cell {
  type: CellType = 'grass';
  friction: number = CONFIG.grassFriction;

  constructor(position: Vector2) {
    super(position);
  }

  render(ctx: CanvasRenderingContext2D): void {
    if (!this.gridCell) return;

    const size = CONFIG.gridSize;
    const x = this.gridCell.worldX;
    const y = this.gridCell.worldY;

    // 确保渲染不超出世界边界
    const maxX = Math.min(x + size, CONFIG.worldWidth);
    const maxY = Math.min(y + size, CONFIG.worldHeight);
    const width = maxX - x;
    const height = maxY - y;

    if (width > 0 && height > 0) {
      ctx.fillStyle = '#3a5a3a';
      ctx.fillRect(x, y, width, height);
    }
  }
}
