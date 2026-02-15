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

    // 计算实际可渲染的区域（考虑1像素的边距）
    const renderX = x + 1;
    const renderY = y + 1;
    const renderWidth = Math.min(size - 2, CONFIG.worldWidth - renderX);
    const renderHeight = Math.min(size - 2, CONFIG.worldHeight - renderY);

    if (renderWidth > 0 && renderHeight > 0) {
      ctx.fillStyle = '#c89650';
      ctx.fillRect(renderX, renderY, renderWidth, renderHeight);

      // 只在有足够空间时绘制中心圆
      const centerX = x + size / 2;
      const centerY = y + size / 2;
      if (renderWidth >= size / 2 && renderHeight >= size / 2 &&
          centerX < CONFIG.worldWidth && centerY < CONFIG.worldHeight) {
        ctx.fillStyle = '#8b6914';
        ctx.beginPath();
        ctx.arc(centerX, centerY, size / 4, 0, Math.PI * 2);
        ctx.fill();
      }
    }
  }
}
