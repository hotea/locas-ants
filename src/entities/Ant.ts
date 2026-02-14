import { Vector2 } from '@/utils/Vector2';
import { Grid } from '@/world/Grid';
import { GridCell } from '@/world/GridCell';
import { CONFIG } from '@/config';
import { normalizeAngle, randomInt } from '@/utils/MathUtils';
import { Food } from '@/cells/Food';
import { Cave } from '@/cells/Cave';
import { Portal } from '@/cells/Portal';

interface PositionMemory {
  x: number;
  y: number;
  time: number;
}

export class Ant {
  position: Vector2;
  direction: number = 0;
  speed: number = 0;
  carrying: boolean = false;

  private currentGridCell: GridCell | null = null;
  private communicateCountdown: number = 0;
  private lastTeleportFrame: number = -999;  // 记录上次传送的帧数，防止连续传送

  // 原算法的关键：存储过去位置的循环队列
  private pastPositions: Vector2[] = [];
  private oldestPositionIndex: number = 0;
  private oldestPosition: Vector2;  // 队列中最老的位置，用于写入信息素

  // 信息素写入控制（找到目标后暂时禁用）
  private pheromoneWriteEnabled: boolean = true;
  private pheromoneEnableTime: number = 0;

  // 当前任务：lookingFor 是正在找的，nextTask 是找到后要找的
  private lookingFor: 'food' | 'cave' = 'food';
  private maxTimeSeen: number = -1;  // 见过的最新信息素时间

  // 原算法关键：lastTimeSeen 记录最后一次看到每种类型的时间
  // 不是交互时间，而是经过该类型格子的时间（即使没有交互）
  private lastTimeSeen: { food: number; cave: number } = { food: -1, cave: -1 };

  private foodMemory: PositionMemory | null = null;

  constructor(position: Vector2, grid: Grid) {
    this.position = position;
    this.resetCommunicateCountdown();
    this.updateGridCell(grid);

    // 初始化位置记忆队列
    for (let i = 0; i < CONFIG.positionMemorySize; i++) {
      this.pastPositions.push(new Vector2(position.x, position.y));
    }
    this.oldestPosition = this.pastPositions[0];
  }

  setCaveMemory(_x: number, _y: number, time: number): void {
    this.lastTimeSeen.cave = time;
  }

  private resetCommunicateCountdown(): void {
    this.communicateCountdown = randomInt(
      CONFIG.communicateIntervalMin,
      CONFIG.communicateIntervalMax
    );
  }

  // 存储当前位置到循环队列
  private storePosition(): void {
    this.pastPositions[this.oldestPositionIndex].x = this.position.x;
    this.pastPositions[this.oldestPositionIndex].y = this.position.y;
    this.oldestPositionIndex = (this.oldestPositionIndex + 1) % CONFIG.positionMemorySize;
    this.oldestPosition = this.pastPositions[this.oldestPositionIndex];
  }

  // 找到目标后调用：交换任务，禁用信息素写入
  private taskFound(frameCount: number): void {
    // 交换任务
    if (this.lookingFor === 'food') {
      this.lookingFor = 'cave';
    } else {
      this.lookingFor = 'food';
    }
    // 原算法：停止速度
    this.speed = 0;
    // 原算法：禁用信息素写入 positionMemorySize 帧（不是 *3）
    this.pheromoneWriteEnabled = false;
    this.pheromoneEnableTime = frameCount + CONFIG.positionMemorySize;
    // 原算法：maxTimeSeen 重置为 0
    this.maxTimeSeen = 0;
  }

  update(grid: Grid): void {
    // 存储位置到记忆队列（原算法的关键）
    this.storePosition();

    this.move(grid);

    this.updateGridCell(grid);

    this.handleCellInteraction(grid);

    // 检查是否可以重新启用信息素写入
    if (!this.pheromoneWriteEnabled && grid.frameCount >= this.pheromoneEnableTime) {
      this.pheromoneWriteEnabled = true;
    }

    this.communicateCountdown--;
    if (this.communicateCountdown <= 0) {
      this.communicate(grid);
      this.resetCommunicateCountdown();
    }
  }

  private move(grid: Grid): void {
    this.speed += CONFIG.antAcceleration;

    const friction = grid.getFriction(this.position.x, this.position.y);
    this.speed *= CONFIG.antFriction * friction;
    this.speed = Math.min(this.speed, CONFIG.antMaxSpeed);

    // 原算法：蚂蚁不主动追踪目标，而是通过信息素导航
    // 只有随机游走和避障，方向调整在 communicate() 中根据信息素进行

    this.direction += (Math.random() - 0.5) * CONFIG.antErratic;
    this.direction = normalizeAngle(this.direction);

    this.avoidObstacles(grid);

    const moveDx = Math.cos(this.direction) * this.speed;
    const moveDy = Math.sin(this.direction) * this.speed;

    let newX = this.position.x + moveDx;
    let newY = this.position.y + moveDy;

    // 边界碰撞
    if (newX < 0 || newX >= CONFIG.worldWidth) {
      this.direction = Math.PI - this.direction + (Math.random() - 0.5) * 0.5;
      newX = Math.max(0, Math.min(CONFIG.worldWidth - 0.1, newX));
    }

    if (newY < 0 || newY >= CONFIG.worldHeight) {
      this.direction = -this.direction + (Math.random() - 0.5) * 0.5;
      newY = Math.max(0, Math.min(CONFIG.worldHeight - 0.1, newY));
    }

    // 障碍物碰撞检测
    if (!grid.isPassable(newX, newY)) {
      const canMoveX = grid.isPassable(newX, this.position.y);
      const canMoveY = grid.isPassable(this.position.x, newY);

      if (canMoveX && !canMoveY) {
        this.position.x = newX;
        this.direction = (moveDx > 0 ? 0 : Math.PI) + (Math.random() - 0.5) * 0.5;
      } else if (canMoveY && !canMoveX) {
        this.position.y = newY;
        this.direction = (moveDy > 0 ? Math.PI / 2 : -Math.PI / 2) + (Math.random() - 0.5) * 0.5;
      } else if (canMoveX && canMoveY) {
        if (Math.random() > 0.5) {
          this.position.x = newX;
          this.direction = (moveDx > 0 ? 0 : Math.PI) + (Math.random() - 0.5) * 0.5;
        } else {
          this.position.y = newY;
          this.direction = (moveDy > 0 ? Math.PI / 2 : -Math.PI / 2) + (Math.random() - 0.5) * 0.5;
        }
      } else {
        // 完全卡住，大幅度随机转向
        this.direction += Math.PI * (0.5 + Math.random());
      }
    } else {
      this.position.x = newX;
      this.position.y = newY;
    }

    this.direction = normalizeAngle(this.direction);
  }

  private avoidObstacles(grid: Grid): void {
    const sightDist = CONFIG.antSightDistance;
    const sightAngle = CONFIG.antSightAngle;

    const aheadX = this.position.x + Math.cos(this.direction) * sightDist;
    const aheadY = this.position.y + Math.sin(this.direction) * sightDist;

    if (!grid.isPassable(aheadX, aheadY)) {
      const leftAngle = this.direction - sightAngle;
      const rightAngle = this.direction + sightAngle;

      const leftX = this.position.x + Math.cos(leftAngle) * sightDist;
      const leftY = this.position.y + Math.sin(leftAngle) * sightDist;
      const leftBlocked = !grid.isPassable(leftX, leftY);

      const rightX = this.position.x + Math.cos(rightAngle) * sightDist;
      const rightY = this.position.y + Math.sin(rightAngle) * sightDist;
      const rightBlocked = !grid.isPassable(rightX, rightY);

      if (!leftBlocked && !rightBlocked) {
        this.direction += (Math.random() > 0.5 ? 1 : -1) * sightAngle;
      } else if (!leftBlocked) {
        this.direction -= sightAngle;
      } else if (!rightBlocked) {
        this.direction += sightAngle;
      } else {
        this.direction += Math.PI;
      }

      this.direction = normalizeAngle(this.direction);
    }
  }

  private updateGridCell(grid: Grid): void {
    const newCell = grid.getGridCell(this.position.x, this.position.y);

    if (newCell !== this.currentGridCell) {
      if (this.currentGridCell) {
        this.currentGridCell.removeAnt(this);
      }
      if (newCell) {
        newCell.addAnt(this);
      }
      this.currentGridCell = newCell;
    }
  }

  private handleCellInteraction(grid: Grid): void {
    if (!this.currentGridCell?.cell) return;

    const cell = this.currentGridCell.cell;
    const now = grid.frameCount;

    // 原算法关键：经过任何感兴趣的格子时，都更新 lastTimeSeen
    // 这样信息素的时间戳会保持新鲜
    if (cell.type === 'food' || cell.type === 'cave') {
      this.lastTimeSeen[cell.type] = now;
    }

    // 只有当正在寻找该类型时才进行交互
    if (cell.type === 'food' && this.lookingFor === 'food') {
      const food = cell as Food;
      if (food.take()) {
        this.carrying = true;
        // 记录食物位置
        this.foodMemory = {
          x: this.position.x,
          y: this.position.y,
          time: now,
        };
        // 原算法：找到目标后反转方向
        this.direction += Math.PI;
        this.direction = normalizeAngle(this.direction);
        this.taskFound(now);

        // Check if food is empty after taking
        if (food.isEmpty()) {
          grid.removeCell(food);
        }
      }
    } else if (cell.type === 'cave' && this.lookingFor === 'cave') {
      const cave = cell as Cave;
      cave.deposit();
      this.carrying = false;
      // 原算法：找到目标后反转方向
      this.direction += Math.PI;
      this.direction = normalizeAngle(this.direction);
      this.taskFound(now);
    } else if (cell.type === 'portal') {
      // 防止频繁传送（使用更长的冷却时间）
      if (now - this.lastTeleportFrame > 30) {  // 30帧冷却，约0.5秒
        const portal = cell as Portal;
        const newPos = portal.teleport(this.position);
        if (newPos) {
          // 传送前记录当前方向
          const oldDirection = this.direction;

          this.position.copy(newPos);
          this.lastTeleportFrame = now;

          // 传送后保持原方向并给予一个推力，快速离开传送门
          this.direction = oldDirection;
          this.speed = CONFIG.antMaxSpeed;  // 给予最大速度

          this.updateGridCell(grid);
        }
      }
    }
  }

  private communicate(grid: Grid): void {
    if (!this.currentGridCell) return;

    const gridX = this.currentGridCell.x;
    const gridY = this.currentGridCell.y;
    const now = grid.frameCount;

    // 原算法：根据当前任务(lookingFor)来寻找对应的信息素
    // lookingFor = 'food' 时找食物信息素，= 'cave' 时找洞穴信息素

    // 扫描周围 3x3 格子的信息素
    for (let dy = -1; dy <= 1; dy++) {
      for (let dx = -1; dx <= 1; dx++) {
        const neighbor = grid.getGridCellAt(gridX + dx, gridY + dy);
        if (!neighbor) continue;

        const pheromone = neighbor.pheromone;

        // 根据当前任务寻找对应信息素
        const interest = this.lookingFor === 'food' ? pheromone.food : pheromone.cave;

        if (interest && now - interest.time < CONFIG.pheromoneDecayTime) {
          // 原算法关键：只有比当前见过的更新鲜才更新方向
          if (interest.time > this.maxTimeSeen) {
            this.maxTimeSeen = interest.time;
            this.headTo(interest.x, interest.y);
          }
        }
      }
    }

    // 原算法：写入信息素（使用 lastTimeSeen 的时间，写入 oldestPosition）
    // 这样信息素形成的是"来时路"的痕迹，其他蚂蚁跟着走就能找到目标
    if (this.pheromoneWriteEnabled) {
      // 原算法：遍历所有感兴趣的类型，同时写入 food 和 cave 信息素
      const types: Array<'food' | 'cave'> = ['food', 'cave'];

      for (const type of types) {
        const myTime = this.lastTimeSeen[type];
        if (myTime < 0) continue;  // 从未见过该类型

        // 对于食物，检查是否还存在
        if (type === 'food' && this.foodMemory) {
          const foodCell = grid.getCellAt(this.foodMemory.x, this.foodMemory.y);
          if (!foodCell || foodCell.type !== 'food') {
            this.foodMemory = null;
            this.lastTimeSeen.food = -1;
            continue;
          }
        }

        const existing = this.currentGridCell.pheromone[type];
        // 原算法：如果我的时间比现有的更新，就覆盖
        if (!existing || myTime > existing.time) {
          this.currentGridCell.pheromone[type] = {
            x: this.oldestPosition.x,
            y: this.oldestPosition.y,
            time: myTime,
          };
        }
      }
    }
  }

  private headTo(targetX: number, targetY: number): void {
    const dx = targetX - this.position.x;
    const dy = targetY - this.position.y;

    // 如果已经在目标位置附近，不调整方向
    const distSq = dx * dx + dy * dy;
    if (distSq < 4) return;

    // 原算法：直接设置方向（更积极的转向）
    this.direction = Math.atan2(dy, dx);
  }
}
