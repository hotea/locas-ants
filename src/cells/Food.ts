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

    // 确保渲染不超出世界边界
    const maxX = Math.min(x + size - 1, CONFIG.worldWidth - 1);
    const maxY = Math.min(y + size - 1, CONFIG.worldHeight - 1);
    const width = maxX - x - 1;
    const height = maxY - y - 1;

    if (width > 0 && height > 0) {
      ctx.fillStyle = this.infinite ? '#4ae04a' : '#7ec850';
      ctx.fillRect(x + 1, y + 1, width, height);

      if (!this.infinite && this.storage < 100) {
        const fillRatio = this.storage / 100;
        ctx.fillStyle = '#2d2d44';
        ctx.fillRect(x + 1, y + 1, width, height * (1 - fillRatio));
      }
    }
  }
}
