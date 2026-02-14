import { Cell, CellType } from './Cell';
import { Vector2 } from '@/utils/Vector2';
import { CONFIG } from '@/config';

export class Cave extends Cell {
  type: CellType = 'cave';
  foodStored: number = 0;

  constructor(position: Vector2) {
    super(position);
  }

  deposit(): void {
    this.foodStored++;
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
      ctx.fillStyle = '#c89650';
      ctx.fillRect(x + 1, y + 1, width, height);

      // 只在有足够空间时绘制中心圆
      if (width >= size / 2 && height >= size / 2) {
        ctx.fillStyle = '#8b6914';
        ctx.beginPath();
        ctx.arc(x + size / 2, y + size / 2, size / 4, 0, Math.PI * 2);
        ctx.fill();
      }
    }
  }
}
