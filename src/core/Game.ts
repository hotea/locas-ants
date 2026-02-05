import { Renderer } from '@/rendering/Renderer';
import { Grid } from '@/world/Grid';
import { Ant } from '@/entities/Ant';
import { InputManager } from '@/input/InputManager';
import { UI } from '@/ui/UI';
import { CONFIG, SETTINGS } from '@/config';
import { Vector2 } from '@/utils/Vector2';
import { Cave } from '@/cells/Cave';
import { Food } from '@/cells/Food';

export class Game {
  renderer: Renderer;
  grid: Grid;
  inputManager: InputManager;
  ui: UI;
  ants: Ant[] = [];

  private lastTime: number = 0;
  private frameCount: number = 0;
  private fpsTime: number = 0;
  fps: number = 0;

  constructor(canvas: HTMLCanvasElement) {
    this.renderer = new Renderer(canvas);
    this.grid = new Grid(CONFIG.worldWidth, CONFIG.worldHeight, CONFIG.gridSize);
    this.inputManager = new InputManager(this);
    this.ui = new UI(this);

    // 设置蚂蚁数量变化回调
    this.ui.controlPanel.onAntCountChange = (count) => this.setAntCount(count);

    this.setupInitialWorld();
    this.spawnAnts();

    this.renderer.camera.position.set(CONFIG.worldWidth / 2, CONFIG.worldHeight / 2);
  }

  private setupInitialWorld(): void {
    const caveX = CONFIG.worldWidth / 2;
    const caveY = CONFIG.worldHeight / 2;
    const cave = new Cave(new Vector2(caveX, caveY));
    this.grid.addCell(cave);

    const foodPositions = [
      new Vector2(100, 100),
      new Vector2(CONFIG.worldWidth - 100, 100),
      new Vector2(100, CONFIG.worldHeight - 100),
      new Vector2(CONFIG.worldWidth - 100, CONFIG.worldHeight - 100),
    ];

    for (const pos of foodPositions) {
      const food = new Food(pos);
      food.storage = 500;
      this.grid.addCell(food);
    }
  }

  private spawnAnts(): void {
    const cave = this.grid.cells.find((c) => c.type === 'cave');
    const spawnPos = cave ? cave.position.clone() : new Vector2(CONFIG.worldWidth / 2, CONFIG.worldHeight / 2);

    for (let i = 0; i < CONFIG.antCount; i++) {
      const ant = new Ant(spawnPos.clone(), this.grid);
      ant.direction = Math.random() * Math.PI * 2;
      ant.setCaveMemory(spawnPos.x, spawnPos.y, 0);
      this.ants.push(ant);
    }
  }

  setAntCount(count: number): void {
    const cave = this.grid.cells.find((c) => c.type === 'cave');
    const spawnPos = cave ? cave.position.clone() : new Vector2(CONFIG.worldWidth / 2, CONFIG.worldHeight / 2);

    if (count > this.ants.length) {
      // 添加蚂蚁
      const toAdd = count - this.ants.length;
      for (let i = 0; i < toAdd; i++) {
        const ant = new Ant(spawnPos.clone(), this.grid);
        ant.direction = Math.random() * Math.PI * 2;
        ant.setCaveMemory(spawnPos.x, spawnPos.y, 0);
        this.ants.push(ant);
      }
    } else if (count < this.ants.length) {
      // 移除蚂蚁
      const toRemove = this.ants.length - count;
      for (let i = 0; i < toRemove; i++) {
        this.ants.pop();
      }
    }
  }

  start(): void {
    this.lastTime = performance.now();
    this.fpsTime = this.lastTime;
    requestAnimationFrame((time) => this.loop(time));
  }

  private loop(time: number): void {
    const dt = (time - this.lastTime) / 1000;
    this.lastTime = time;

    this.frameCount++;
    if (time - this.fpsTime >= 1000) {
      this.fps = this.frameCount;
      this.frameCount = 0;
      this.fpsTime = time;
    }

    this.update(dt);
    this.render();

    requestAnimationFrame((t) => this.loop(t));
  }

  private simulationAccumulator: number = 0;

  private update(_dt: number): void {
    // 使用运行时设置的速度
    this.simulationAccumulator += SETTINGS.simulationSpeed;

    while (this.simulationAccumulator >= 1) {
      this.simulationAccumulator -= 1;

      for (const ant of this.ants) {
        ant.update(this.grid);
      }

      this.grid.update();
    }
  }

  private render(): void {
    this.renderer.clear();

    this.renderer.beginWorldRender();
    this.renderer.drawWorldBounds();
    this.renderer.drawGrid();

    this.grid.render(this.renderer.ctx, this.renderer.camera);

    // 先渲染信息素（在蚂蚁下面）
    if (SETTINGS.showPheromones) {
      this.renderPheromones();
    }

    this.renderAnts();

    this.renderer.endWorldRender();

    this.ui.render(this.renderer.ctx);
  }

  private renderPheromones(): void {
    const ctx = this.renderer.ctx;
    const bounds = this.renderer.camera.getVisibleBounds();
    const now = this.grid.frameCount;
    const size = CONFIG.gridSize;

    // 计算可见的格子范围
    const startX = Math.max(0, Math.floor(bounds.left / size));
    const startY = Math.max(0, Math.floor(bounds.top / size));
    const endX = Math.min(this.grid.cols - 1, Math.ceil(bounds.right / size));
    const endY = Math.min(this.grid.rows - 1, Math.ceil(bounds.bottom / size));

    ctx.lineWidth = 1;

    // 遍历可见格子，绘制信息素
    for (let y = startY; y <= endY; y++) {
      for (let x = startX; x <= endX; x++) {
        const gridCell = this.grid.gridCells[y][x];
        const pheromone = gridCell.pheromone;
        const centerX = gridCell.centerX;
        const centerY = gridCell.centerY;

        // 绘制食物信息素（黄色）
        if (pheromone.food && pheromone.food.x !== 0 && pheromone.food.y !== 0) {
          // 原算法: alpha = 255 - ((currentFrame - info.time) / 5)
          const age = now - pheromone.food.time;
          let alpha = 1 - age / (CONFIG.pheromoneDecayTime * 0.8);
          if (alpha < 0.1) alpha = 0.05;
          if (alpha > 0) {
            ctx.strokeStyle = `rgba(255, 255, 180, ${alpha * 0.6})`;
            ctx.fillStyle = `rgba(255, 255, 180, ${alpha * 0.6})`;

            // 画小圆点
            ctx.beginPath();
            ctx.arc(centerX, centerY, 1.5, 0, Math.PI * 2);
            ctx.fill();

            // 画线指向 where（蚂蚁来的方向）
            ctx.beginPath();
            ctx.moveTo(centerX, centerY);
            ctx.lineTo(pheromone.food.x, pheromone.food.y);
            ctx.stroke();
          }
        }

        // 绘制洞穴信息素（蓝色）
        if (pheromone.cave && pheromone.cave.x !== 0 && pheromone.cave.y !== 0) {
          const age = now - pheromone.cave.time;
          let alpha = 1 - age / (CONFIG.pheromoneDecayTime * 0.8);
          if (alpha < 0.1) alpha = 0.05;
          if (alpha > 0) {
            ctx.strokeStyle = `rgba(180, 200, 255, ${alpha * 0.6})`;
            ctx.fillStyle = `rgba(180, 200, 255, ${alpha * 0.6})`;

            // 画小圆点
            ctx.beginPath();
            ctx.arc(centerX, centerY, 1.5, 0, Math.PI * 2);
            ctx.fill();

            // 画线指向 where（蚂蚁来的方向）
            ctx.beginPath();
            ctx.moveTo(centerX, centerY);
            ctx.lineTo(pheromone.cave.x, pheromone.cave.y);
            ctx.stroke();
          }
        }
      }
    }
  }

  private renderAnts(): void {
    const ctx = this.renderer.ctx;
    const bounds = this.renderer.camera.getVisibleBounds();

    for (const ant of this.ants) {
      if (
        ant.position.x < bounds.left - 5 ||
        ant.position.x > bounds.right + 5 ||
        ant.position.y < bounds.top - 5 ||
        ant.position.y > bounds.bottom + 5
      ) {
        continue;
      }

      ctx.save();
      ctx.translate(ant.position.x, ant.position.y);
      ctx.rotate(ant.direction);

      if (ant.carrying) {
        ctx.fillStyle = '#7ec850';
      } else {
        ctx.fillStyle = '#e8c547';
      }

      ctx.beginPath();
      ctx.ellipse(0, 0, 3, 2, 0, 0, Math.PI * 2);
      ctx.fill();

      ctx.restore();
    }
  }
}
