import { GridCell } from './GridCell';
import { Cell } from '@/cells/Cell';
import { Camera } from '@/rendering/Camera';

export class Grid {
  width: number;
  height: number;
  cellSize: number;
  cols: number;
  rows: number;
  gridCells: GridCell[][];
  cells: Cell[] = [];

  frameCount: number = 0;  // 公开给蚂蚁使用

  constructor(width: number, height: number, cellSize: number) {
    this.width = width;
    this.height = height;
    this.cellSize = cellSize;
    this.cols = Math.ceil(width / cellSize);
    this.rows = Math.ceil(height / cellSize);

    this.gridCells = [];
    for (let y = 0; y < this.rows; y++) {
      this.gridCells[y] = [];
      for (let x = 0; x < this.cols; x++) {
        this.gridCells[y][x] = new GridCell(x, y, cellSize);
      }
    }
  }

  getGridCell(worldX: number, worldY: number): GridCell | null {
    const x = Math.floor(worldX / this.cellSize);
    const y = Math.floor(worldY / this.cellSize);
    return this.getGridCellAt(x, y);
  }

  getGridCellAt(gridX: number, gridY: number): GridCell | null {
    if (gridX < 0 || gridX >= this.cols || gridY < 0 || gridY >= this.rows) {
      return null;
    }
    return this.gridCells[gridY][gridX];
  }

  addCell(cell: Cell): void {
    const gridCell = this.getGridCell(cell.position.x, cell.position.y);
    if (gridCell) {
      if (gridCell.cell) {
        this.removeCell(gridCell.cell);
      }
      gridCell.setCell(cell);
      cell.gridCell = gridCell;
      this.cells.push(cell);

      // 如果放置的是不可通行的物体，把里面的蚂蚁推出去
      if (!cell.passable) {
        const antsInCell = gridCell.ants.toArray();
        for (const ant of antsInCell) {
          // 把蚂蚁推到格子外面
          const centerX = gridCell.centerX;
          const centerY = gridCell.centerY;
          const dx = ant.position.x - centerX;
          const dy = ant.position.y - centerY;
          const dist = Math.sqrt(dx * dx + dy * dy);

          let pushAngle: number;
          let pushDistance: number;

          // 如果蚂蚁在格子中心或距离太近，给一个随机方向
          if (dist < 1) {
            pushAngle = Math.random() * Math.PI * 2;
            pushDistance = this.cellSize * 0.8;
          } else {
            pushAngle = Math.atan2(dy, dx);
            pushDistance = this.cellSize * 0.8;
          }

          // 尝试推到目标位置
          let newX = centerX + Math.cos(pushAngle) * pushDistance;
          let newY = centerY + Math.sin(pushAngle) * pushDistance;

          // 确保推到的位置是可通行的，如果不可通行则尝试其他方向
          if (!this.isPassable(newX, newY)) {
            // 尝试8个方向找到可通行位置
            const angles = [0, Math.PI / 4, Math.PI / 2, (3 * Math.PI) / 4, Math.PI, -(3 * Math.PI) / 4, -Math.PI / 2, -Math.PI / 4];
            for (const angle of angles) {
              const testX = centerX + Math.cos(angle) * pushDistance;
              const testY = centerY + Math.sin(angle) * pushDistance;
              if (this.isPassable(testX, testY)) {
                newX = testX;
                newY = testY;
                pushAngle = angle;
                break;
              }
            }
          }

          // 边界检查
          newX = Math.max(0, Math.min(this.width - 1, newX));
          newY = Math.max(0, Math.min(this.height - 1, newY));

          ant.position.x = newX;
          ant.position.y = newY;
          ant.direction = pushAngle;
          // 给予速度帮助快速离开
          ant.speed = 2;
        }
      }
    }
  }

  removeCell(cell: Cell): void {
    const index = this.cells.indexOf(cell);
    if (index >= 0) {
      this.cells.splice(index, 1);
    }
    // Always clear gridCell reference even if cell.gridCell is null
    // to prevent stale references in grid
    const gridCell = cell.gridCell;
    if (gridCell) {
      gridCell.setCell(null);
    }
    cell.gridCell = null;
  }

  clearAllCells(): void {
    // 清除所有格子的cell引用
    for (let y = 0; y < this.rows; y++) {
      for (let x = 0; x < this.cols; x++) {
        const gridCell = this.gridCells[y][x];
        gridCell.setCell(null);
        // 清除信息素
        gridCell.pheromone.food = null;
        gridCell.pheromone.cave = null;
      }
    }
  }

  getCellAt(worldX: number, worldY: number): Cell | null {
    const gridCell = this.getGridCell(worldX, worldY);
    return gridCell?.cell ?? null;
  }

  isPassable(worldX: number, worldY: number): boolean {
    if (worldX < 0 || worldX >= this.width || worldY < 0 || worldY >= this.height) {
      return false;
    }
    const gridCell = this.getGridCell(worldX, worldY);
    return gridCell?.passable ?? false;
  }

  getFriction(worldX: number, worldY: number): number {
    const gridCell = this.getGridCell(worldX, worldY);
    return gridCell?.friction ?? 1;
  }

  update(): void {
    this.frameCount++;

    for (const cell of this.cells) {
      cell.update(this.frameCount);
    }
  }

  render(ctx: CanvasRenderingContext2D, camera: Camera): void {
    const bounds = camera.getVisibleBounds();
    const startX = Math.max(0, Math.floor(bounds.left / this.cellSize));
    const startY = Math.max(0, Math.floor(bounds.top / this.cellSize));
    const endX = Math.min(this.cols - 1, Math.ceil(bounds.right / this.cellSize));
    const endY = Math.min(this.rows - 1, Math.ceil(bounds.bottom / this.cellSize));

    // 只渲染环境元素（食物、洞穴等）
    for (let y = startY; y <= endY; y++) {
      for (let x = startX; x <= endX; x++) {
        const gridCell = this.gridCells[y][x];
        if (gridCell.cell) {
          gridCell.cell.render(ctx);
        }
      }
    }
  }
}
