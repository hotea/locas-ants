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

    // 计算实际可渲染的区域（考虑1像素的边距）
    const renderX = x + 1;
    const renderY = y + 1;
    const renderWidth = Math.min(size - 2, CONFIG.worldWidth - renderX);
    const renderHeight = Math.min(size - 2, CONFIG.worldHeight - renderY);

    if (renderWidth > 0 && renderHeight > 0) {
      ctx.fillStyle = this.infinite ? '#4ae04a' : '#7ec850';
      ctx.fillRect(renderX, renderY, renderWidth, renderHeight);

      if (!this.infinite && this.storage < 100) {
        const fillRatio = this.storage / 100;
        ctx.fillStyle = '#2d2d44';
        ctx.fillRect(renderX, renderY, renderWidth, renderHeight * (1 - fillRatio));
      }
    }
  }
}
