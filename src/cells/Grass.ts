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

    ctx.fillStyle = '#3a5a3a';
    ctx.fillRect(x, y, size, size);
  }
}
