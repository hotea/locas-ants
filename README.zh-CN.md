# Locas Ants - 蚁群模拟

**中文** | [English](./README.md)

一个基于浏览器的蚁群模拟项目，使用信息素启发的寻路算法。本项目是对 [piXelicidio/locas-ants](https://github.com/piXelicidio/locas-ants) 的完全重写，从 Lua + LÖVE 2D 迁移到 TypeScript + Canvas。

![蚁群模拟](https://img.shields.io/badge/蚂蚁-500-green) ![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue) ![许可证](https://img.shields.io/badge/license-MIT-orange)

## 特性

- 🐜 **500+ 蚂蚁**：实时模拟数百只蚂蚁
- 🧭 **信息素寻路**：通过间接交流产生涌现行为
- 🎨 **交互工具**：放置食物、蚁巢、障碍物、草地和传送门
- 🌐 **双语界面**：中英文自由切换
- ⚡ **高性能**：使用空间分割优化渲染
- 🎮 **流畅控制**：平移、缩放和调整模拟速度

## 核心算法：信息素通讯

本模拟实现了一个**受生物启发的基于信息素的寻路算法**，蚂蚁之间不直接通信，也不知道目标的确切位置。相反，它们留下"面包屑轨迹"供其他蚂蚁跟随。

### 工作原理

1. **位置记忆队列**
   - 每只蚂蚁维护一个包含过去 10 个位置的循环缓冲区
   - 队列中最老的位置用于写入信息素

2. **信息素写入**
   ```
   当蚂蚁知道食物/洞穴位置时：
   ├─ 向当前网格单元写入信息素
   ├─ 信息素指向：oldestPosition（蚂蚁 10 帧前的位置）
   └─ 信息素时间戳：lastTimeSeen[type]
   ```

3. **信息素读取**
   ```
   每 3-13 帧：
   ├─ 扫描周围 3×3 网格单元
   ├─ 寻找感兴趣的信息素（食物或洞穴）
   ├─ 如果 pheromone.time > maxTimeSeen：
   │  ├─ 更新 maxTimeSeen
   │  └─ 转向 pheromone.where
   └─ 继续随机游走 + 避障
   ```

4. **任务切换**
   ```
   当蚂蚁找到目标（食物/洞穴）时：
   ├─ 交换 lookingFor ↔ nextTask
   ├─ 反转方向（转 180°）
   ├─ 停止移动（speed = 0）
   ├─ 禁用信息素写入 10 帧
   └─ 重置 maxTimeSeen = 0
   ```

### 为什么有效

- **面包屑轨迹**：信息素指向蚂蚁走过的路径，而不是直接指向目标
- **自然路径形成**：跟随信息素的蚂蚁自然地绕过障碍物
- **间接协调**：通过环境修改实现间接协调（Stigmergy）
- **涌现行为**：从简单的个体规则产生复杂的群体级模式

## 技术栈

- **语言**：TypeScript
- **渲染**：Canvas 2D API
- **构建工具**：Vite
- **架构**：实体组件系统 + 空间分割

## 项目结构

```
locas-ants/
├── src/
│   ├── main.ts                 # 入口点
│   ├── config.ts               # 配置文件
│   ├── core/
│   │   └── Game.ts             # 游戏循环和状态
│   ├── entities/
│   │   └── Ant.ts              # 蚂蚁逻辑和行为
│   ├── world/
│   │   ├── Grid.ts             # 空间分割网格
│   │   ├── GridCell.ts         # 带信息素的网格单元
│   │   └── QuickList.ts        # O(1) 链表
│   ├── cells/
│   │   ├── Cell.ts             # 单元格基类
│   │   ├── Food.ts             # 食物源
│   │   ├── Cave.ts             # 蚁巢
│   │   ├── Grass.ts            # 摩擦力修改器
│   │   ├── Obstacle.ts         # 阻挡物体
│   │   └── Portal.ts           # 传送门
│   ├── systems/
│   │   └── ...                 # 未来的系统模块
│   ├── rendering/
│   │   ├── Renderer.ts         # Canvas 渲染器
│   │   └── Camera.ts           # 视口控制
│   ├── ui/
│   │   ├── UI.ts               # UI 协调器
│   │   ├── ToolPanel.ts        # 工具选择
│   │   └── ControlPanel.ts    # 设置和控制
│   ├── input/
│   │   └── InputManager.ts    # 鼠标和键盘
│   ├── utils/
│   │   ├── Vector2.ts          # 2D 向量数学
│   │   └── MathUtils.ts        # 数学工具
│   └── i18n/
│       └── index.ts            # 国际化
└── index.html
```

## 快速开始

### 前置要求

- Node.js 16+ 和 npm

### 安装

```bash
# 克隆仓库
git clone https://github.com/hotea/locas-ants.git
cd locas-ants

# 安装依赖
npm install

# 启动开发服务器
npm run dev
```

在浏览器中打开 http://localhost:5173。

### 生产构建

```bash
npm run build
```

构建文件将在 `dist/` 目录中。

## 控制说明

### 工具（键盘 1-7）
- **1**：拖动 - 点击并拖动以移动视图
- **2**：障碍 - 放置障碍物
- **3**：草地 - 放置草地（增加摩擦力）
- **4**：蚁巢 - 放置蚁巢
- **5**：食物 - 放置食物源
- **6**：传送门 - 放置传送门（自动配对）
- **7**：删除 - 移除单元格

### 摄像机
- **鼠标拖动**：平移视图
- **鼠标滚轮**：放大/缩小

### 设置（右上角面板）
- **速度**：调整模拟速度（0.5x - 5x）
- **蚂蚁**：改变蚂蚁数量（100 - 5000）
- **显示信息素**：切换信息素可视化
- **语言**：在中文和英文之间切换

## 关键实现细节

### 蚂蚁移动物理
```typescript
speed += acceleration;
speed *= friction;
speed = Math.min(speed, maxSpeed);
direction += (Math.random() - 0.5) * erratic;
position.x += Math.cos(direction) * speed;
position.y += Math.sin(direction) * speed;
```

### 信息素数据结构
```typescript
interface PheromoneInfo {
  food: { x: number; y: number; time: number } | null;
  cave: { x: number; y: number; time: number } | null;
}
```

### 碰撞检测
- **基于网格**：16×16 像素单元用于空间分割
- **滑动**：蚂蚁沿墙滑动而不是停止
- **障碍避免**：30px 前视距离，±30° 左右检测

## 配置

编辑 `src/config.ts` 进行自定义：

```typescript
export const CONFIG = {
  antCount: 500,              // 初始蚂蚁数量
  antMaxSpeed: 1.2,           // 最大蚂蚁速度
  antErratic: 0.2,            // 随机游走量
  antSightDistance: 30,       // 障碍检测范围
  positionMemorySize: 10,     // 记忆队列长度
  communicateIntervalMin: 3,  // 信息素更新最小间隔帧数
  communicateIntervalMax: 13, // 信息素更新最大间隔帧数
  pheromoneDecayTime: 600,    // 信息素过期前的帧数
  // ... 更多设置
};
```

## 性能

- **目标**：500 只蚂蚁保持 60 FPS
- **优化技术**：
  - 使用网格进行空间分割
  - 视口裁剪（仅渲染可见元素）
  - 使用链表进行 O(1) 实体管理
  - 高效的信息素更新（3-13 帧间隔）

## 原始项目

这是对 piXelicidio 的 [locas-ants](https://github.com/piXelicidio/locas-ants) 项目的重写。原项目使用 Lua 和 LÖVE 2D 框架编写。此版本在保持核心算法的同时，现代化了技术栈以便于 Web 部署。

### 与原版的变化
- **平台**：Lua + LÖVE → TypeScript + 浏览器
- **架构**：过程式 → 面向对象 + ECS 模式
- **渲染**：Love2D API → Canvas 2D API
- **UI**：SUIT 库 → 自定义 Canvas UI
- **新增**：国际化（i18n）
- **新增**：运行时控制调整

## 贡献

欢迎贡献！请随时提交 Pull Request。

## 许可证

MIT License - 详见 [LICENSE](LICENSE)

## 致谢

- 原始概念和算法：[piXelicidio](https://github.com/piXelicidio)
- 重写和现代化：本项目

## 参考资料

- [Stigmergy（间接协调）](https://zh.wikipedia.org/wiki/%E9%97%B4%E6%8E%A5%E5%8D%8F%E8%B0%83) - 间接协调机制
- [蚁群优化算法](https://zh.wikipedia.org/wiki/%E8%9A%81%E7%BE%A4%E7%AE%97%E6%B3%95) - 相关优化算法
- [LÖVE 2D](https://love2d.org/) - 原始框架
