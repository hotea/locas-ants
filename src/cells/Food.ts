import { Cell, CellType } from './Cell';
import { Vector2 } from '@/utils/Vector2';
import { CONFIG } from '@/config';

export class Food extends Cell {
  type: CellType = 'food';
  storage: number = 100;
  infinite: boolean = false;

  constructor(position: Vector2) {
    super(position);
  }

  take(): boolean {
    if (this.infinite) return true;
    if (this.storage > 0) {
      this.storage--;
      return true;
    }
    return false;
  }

  isEmpty(): boolean {
    return !this.infinite && this.storage <= 0;
  }

  render(ctx: CanvasRenderingContext2D): void {
    if (!this.gridCell) return;

    const size = CONFIG.gridSize;
    const x = this.gridCell.worldX;
    const y = this.gridCell.worldY;

    ctx.fillStyle = this.infinite ? '#4ae04a' : '#7ec850';
    ctx.fillRect(x + 1, y + 1, size - 2, size - 2);

    if (!this.infinite && this.storage < 100) {
      const fillRatio = this.storage / 100;
      ctx.fillStyle = '#2d2d44';
      ctx.fillRect(x + 1, y + 1, size - 2, (size - 2) * (1 - fillRatio));
    }
  }
}
