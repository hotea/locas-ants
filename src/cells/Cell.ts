import { Vector2 } from '@/utils/Vector2';
import { GridCell } from '@/world/GridCell';

export type CellType = 'food' | 'cave' | 'grass' | 'obstacle' | 'portal';

export abstract class Cell {
  position: Vector2;
  gridCell: GridCell | null = null;
  abstract type: CellType;
  passable: boolean = true;
  friction: number = 1;

  constructor(position: Vector2) {
    this.position = position.clone();
  }

  abstract render(ctx: CanvasRenderingContext2D): void;

  update(_frameCount: number): void {}
}
