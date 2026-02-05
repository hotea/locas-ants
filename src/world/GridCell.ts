import { QuickList } from './QuickList';
import { Ant } from '@/entities/Ant';
import { Cell } from '@/cells/Cell';

export interface PheromoneInfo {
  food: { x: number; y: number; time: number } | null;
  cave: { x: number; y: number; time: number } | null;
}

export class GridCell {
  x: number;
  y: number;
  worldX: number;
  worldY: number;
  size: number;

  ants: QuickList<Ant> = new QuickList();
  cell: Cell | null = null;
  pheromone: PheromoneInfo = {
    food: null,
    cave: null,
  };

  friction: number = 1;
  passable: boolean = true;

  constructor(x: number, y: number, size: number) {
    this.x = x;
    this.y = y;
    this.size = size;
    this.worldX = x * size;
    this.worldY = y * size;
  }

  get centerX(): number {
    return this.worldX + this.size / 2;
  }

  get centerY(): number {
    return this.worldY + this.size / 2;
  }

  addAnt(ant: Ant): void {
    this.ants.add(ant);
  }

  removeAnt(ant: Ant): void {
    this.ants.remove(ant);
  }

  setCell(cell: Cell | null): void {
    this.cell = cell;
    if (cell) {
      this.passable = cell.passable;
      this.friction = cell.friction;
    } else {
      this.passable = true;
      this.friction = 1;
    }
  }
}
