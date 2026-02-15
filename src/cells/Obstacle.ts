import { Cell, CellType } from './Cell';
import { Vector2 } from '@/utils/Vector2';
import { CONFIG } from '@/config';

export class Obstacle extends Cell {
  type: CellType = 'obstacle';

  constructor(position: Vector2) {
    super(position);
    this.passable = false;  // 在构造函数中显式设置
  }

  render(ctx: CanvasRenderingContext2D): void {
    if (!this.gridCell) return;

    const size = CONFIG.gridSize;
    const x = this.gridCell.worldX;
    const y = this.gridCell.worldY;

    ctx.fillStyle = '#5a5a7a';
    ctx.fillRect(x, y, size, size);
  }
}
