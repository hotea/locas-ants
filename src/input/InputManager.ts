import { Game } from '@/core/Game';
import { Vector2 } from '@/utils/Vector2';
import { Food } from '@/cells/Food';
import { Cave } from '@/cells/Cave';
import { Grass } from '@/cells/Grass';
import { Obstacle } from '@/cells/Obstacle';
import { Portal } from '@/cells/Portal';

export class InputManager {
  game: Game;

  private isDragging: boolean = false;
  private lastMousePos: Vector2 = new Vector2();
  private mousePos: Vector2 = new Vector2();
  private isMouseDown: boolean = false;

  constructor(game: Game) {
    this.game = game;

    const canvas = game.renderer.canvas;

    canvas.addEventListener('mousedown', (e) => this.onMouseDown(e));
    canvas.addEventListener('mousemove', (e) => this.onMouseMove(e));
    canvas.addEventListener('mouseup', (e) => this.onMouseUp(e));
    canvas.addEventListener('wheel', (e) => this.onWheel(e), { passive: false });
    canvas.addEventListener('contextmenu', (e) => e.preventDefault());

    window.addEventListener('keydown', (e) => this.onKeyDown(e));
  }

  private onMouseDown(e: MouseEvent): void {
    this.mousePos.set(e.clientX, e.clientY);
    this.lastMousePos.copy(this.mousePos);
    this.isMouseDown = true;

    // 检查控制面板
    if (this.game.ui.controlPanel.handleMouseDown(e.clientX, e.clientY)) {
      return;
    }

    // 检查工具面板
    if (this.game.ui.toolPanel.handleClick(e.clientX, e.clientY)) {
      return;
    }

    const tool = this.game.ui.toolPanel.selectedTool;

    if (tool === 'pan' || e.button === 2) {
      this.isDragging = true;
    } else {
      this.useTool(e.clientX, e.clientY);
    }
  }

  private onMouseMove(e: MouseEvent): void {
    this.mousePos.set(e.clientX, e.clientY);

    // 检查控制面板拖拽
    if (this.game.ui.controlPanel.handleMouseMove(e.clientX, e.clientY)) {
      this.lastMousePos.copy(this.mousePos);
      return;
    }

    if (this.isDragging) {
      const dx = this.mousePos.x - this.lastMousePos.x;
      const dy = this.mousePos.y - this.lastMousePos.y;
      this.game.renderer.camera.pan(dx, dy);
    } else if (this.isMouseDown && this.game.ui.toolPanel.selectedTool !== 'pan') {
      if (
        !this.game.ui.toolPanel.isOverPanel(e.clientX, e.clientY) &&
        !this.game.ui.controlPanel.isOverPanel(e.clientX, e.clientY)
      ) {
        this.useTool(e.clientX, e.clientY);
      }
    }

    this.lastMousePos.copy(this.mousePos);
  }

  private onMouseUp(_e: MouseEvent): void {
    this.isDragging = false;
    this.isMouseDown = false;
    this.game.ui.controlPanel.handleMouseUp();
  }

  private onWheel(e: WheelEvent): void {
    e.preventDefault();
    this.game.renderer.camera.zoomAt(e.clientX, e.clientY, e.deltaY);
  }

  private onKeyDown(e: KeyboardEvent): void {
    if (this.game.ui.toolPanel.handleKey(e.key)) {
      return;
    }
  }

  private useTool(screenX: number, screenY: number): void {
    const worldPos = this.game.renderer.camera.screenToWorld(screenX, screenY);
    const tool = this.game.ui.toolPanel.selectedTool;
    const grid = this.game.grid;

    const existingCell = grid.getCellAt(worldPos.x, worldPos.y);

    switch (tool) {
      case 'block':
        if (!existingCell) {
          grid.addCell(new Obstacle(worldPos));
        }
        break;

      case 'grass':
        if (!existingCell) {
          grid.addCell(new Grass(worldPos));
        }
        break;

      case 'cave':
        if (!existingCell) {
          grid.addCell(new Cave(worldPos));
        }
        break;

      case 'food':
        if (!existingCell) {
          const food = new Food(worldPos);
          food.storage = 100;
          grid.addCell(food);
        }
        break;

      case 'portal':
        if (!existingCell) {
          const pending = this.game.ui.toolPanel.getPendingPortal();
          const portal = new Portal(worldPos);
          grid.addCell(portal);

          if (pending) {
            const pendingCell = grid.getCellAt(pending.x, pending.y);
            if (pendingCell && pendingCell.type === 'portal') {
              portal.link(pendingCell as Portal);
            }
            this.game.ui.toolPanel.clearPendingPortal();
          } else {
            this.game.ui.toolPanel.setPendingPortal(worldPos.x, worldPos.y);
          }
        }
        break;

      case 'remove':
        if (existingCell) {
          if (existingCell.type === 'portal') {
            const portal = existingCell as Portal;
            if (portal.linkedPortal) {
              portal.linkedPortal.linkedPortal = null;
            }
          }
          grid.removeCell(existingCell);
        }
        break;
    }
  }
}
