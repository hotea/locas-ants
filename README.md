# Locas Ants - Ant Colony Simulation

[中文](./README.zh-CN.md) | **English**

A browser-based ant colony simulation using pheromone-inspired pathfinding algorithms. This project is a complete rewrite of [piXelicidio/locas-ants](https://github.com/piXelicidio/locas-ants) from Lua + LÖVE 2D to TypeScript + Canvas.

![Ant Colony Simulation](https://img.shields.io/badge/ants-500-green) ![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue) ![License](https://img.shields.io/badge/license-MIT-orange)

## Features

- 🐜 **500+ Ants**: Real-time simulation of hundreds of ants
- 🧭 **Pheromone Pathfinding**: Emergent behavior through indirect communication
- 🎨 **Interactive Tools**: Place food, caves, obstacles, grass, and portals
- 🌐 **Bilingual UI**: Switch between English and Chinese
- ⚡ **High Performance**: Optimized rendering with spatial partitioning
- 🎮 **Smooth Controls**: Pan, zoom, and adjust simulation speed

## Core Algorithm: Pheromone Communication

This simulation implements a **bio-inspired pheromone-based pathfinding algorithm** where ants don't directly communicate or know the exact location of targets. Instead, they leave "breadcrumb trails" that other ants can follow.

### How It Works

1. **Position Memory Queue**
   - Each ant maintains a circular buffer of its past 10 positions
   - The oldest position in the queue is used for pheromone writing

2. **Pheromone Writing**
   ```
   When ant knows about food/cave location:
   ├─ Write pheromone to current grid cell
   ├─ Pheromone points to: oldestPosition (where ant was 10 frames ago)
   └─ Pheromone timestamp: lastTimeSeen[type]
   ```

3. **Pheromone Reading**
   ```
   Every 3-13 frames:
   ├─ Scan 3×3 surrounding grid cells
   ├─ Find pheromones of interest (food or cave)
   ├─ If pheromone.time > maxTimeSeen:
   │  ├─ Update maxTimeSeen
   │  └─ Turn towards pheromone.where
   └─ Continue random walk + obstacle avoidance
   ```

4. **Task Switching**
   ```
   When ant finds target (food/cave):
   ├─ Swap lookingFor ↔ nextTask
   ├─ Reverse direction (turn 180°)
   ├─ Stop movement (speed = 0)
   ├─ Disable pheromone writing for 10 frames
   └─ Reset maxTimeSeen = 0
   ```

### Why This Works

- **Breadcrumb Trails**: Pheromones point backwards along the path the ant traveled, not directly to the target
- **Natural Path Formation**: Ants following pheromones naturally navigate around obstacles
- **Stigmergy**: Indirect coordination through environmental modification
- **Emergent Behavior**: Complex colony-level patterns emerge from simple individual rules

## Tech Stack

- **Language**: TypeScript
- **Rendering**: Canvas 2D API
- **Build Tool**: Vite
- **Architecture**: Entity-Component System with spatial partitioning

## Project Structure

```
locas-ants/
├── src/
│   ├── main.ts                 # Entry point
│   ├── config.ts               # Configuration
│   ├── core/
│   │   └── Game.ts             # Game loop and state
│   ├── entities/
│   │   └── Ant.ts              # Ant logic and behavior
│   ├── world/
│   │   ├── Grid.ts             # Spatial partitioning grid
│   │   ├── GridCell.ts         # Grid cell with pheromones
│   │   └── QuickList.ts        # O(1) linked list
│   ├── cells/
│   │   ├── Cell.ts             # Base cell class
│   │   ├── Food.ts             # Food source
│   │   ├── Cave.ts             # Ant nest
│   │   ├── Grass.ts            # Friction modifier
│   │   ├── Obstacle.ts         # Blocking object
│   │   └── Portal.ts           # Teleporter
│   ├── systems/
│   │   └── ...                 # Future system modules
│   ├── rendering/
│   │   ├── Renderer.ts         # Canvas renderer
│   │   └── Camera.ts           # Viewport control
│   ├── ui/
│   │   ├── UI.ts               # UI coordinator
│   │   ├── ToolPanel.ts        # Tool selection
│   │   └── ControlPanel.ts    # Settings and controls
│   ├── input/
│   │   └── InputManager.ts    # Mouse and keyboard
│   ├── utils/
│   │   ├── Vector2.ts          # 2D vector math
│   │   └── MathUtils.ts        # Math utilities
│   └── i18n/
│       └── index.ts            # Internationalization
└── index.html
```

## Getting Started

### Prerequisites

- Node.js 16+ and npm

### Installation

```bash
# Clone the repository
git clone https://github.com/hotea/locas-ants.git
cd locas-ants

# Install dependencies
npm install

# Start development server
npm run dev
```

Open http://localhost:5173 in your browser.

### Build for Production

```bash
npm run build
```

The built files will be in the `dist/` directory.

## Controls

### Tools (Keyboard 1-7)
- **1**: Pan - Click and drag to move the view
- **2**: Block - Place obstacles
- **3**: Grass - Place grass (adds friction)
- **4**: Cave - Place ant nest
- **5**: Food - Place food source
- **6**: Portal - Place teleporter (pairs automatically)
- **7**: Remove - Remove cells

### Camera
- **Mouse Drag**: Pan the view
- **Mouse Wheel**: Zoom in/out

### Settings (Top Right Panel)
- **Speed**: Adjust simulation speed (0.5x - 5x)
- **Ants**: Change ant count (100 - 5000)
- **Pheromones**: Toggle pheromone visualization
- **Language**: Switch between English and Chinese

## Key Implementation Details

### Ant Movement Physics
```typescript
speed += acceleration;
speed *= friction;
speed = Math.min(speed, maxSpeed);
direction += (Math.random() - 0.5) * erratic;
position.x += Math.cos(direction) * speed;
position.y += Math.sin(direction) * speed;
```

### Pheromone Data Structure
```typescript
interface PheromoneInfo {
  food: { x: number; y: number; time: number } | null;
  cave: { x: number; y: number; time: number } | null;
}
```

### Collision Detection
- **Grid-based**: 16×16 pixel cells for spatial partitioning
- **Sliding**: Ants slide along walls instead of stopping
- **Obstacle Avoidance**: 30px forward vision with ±30° left/right checking

## Configuration

Edit `src/config.ts` to customize:

```typescript
export const CONFIG = {
  antCount: 500,              // Initial ant count
  antMaxSpeed: 1.2,           // Maximum ant speed
  antErratic: 0.2,            // Random walk amount
  antSightDistance: 30,       // Obstacle detection range
  positionMemorySize: 10,     // Memory queue length
  communicateIntervalMin: 3,  // Min frames between pheromone updates
  communicateIntervalMax: 13, // Max frames between pheromone updates
  pheromoneDecayTime: 600,    // Frames before pheromone expires
  // ... more settings
};
```

## Performance

- **Target**: 60 FPS with 500 ants
- **Optimization Techniques**:
  - Spatial partitioning with grid
  - Viewport culling (only render visible elements)
  - O(1) entity management with linked lists
  - Efficient pheromone updates (3-13 frame intervals)

## Original Project

This is a rewrite of [locas-ants](https://github.com/piXelicidio/locas-ants) by piXelicidio. The original project was written in Lua using the LÖVE 2D framework. This version maintains the core algorithm while modernizing the tech stack for web deployment.

### Changes from Original
- **Platform**: Lua + LÖVE → TypeScript + Browser
- **Architecture**: Procedural → Object-Oriented + ECS patterns
- **Rendering**: Love2D API → Canvas 2D API
- **UI**: SUIT library → Custom Canvas UI
- **Added**: Internationalization (i18n)
- **Added**: Runtime control adjustments

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

MIT License - see [LICENSE](LICENSE) for details

## Credits

- Original concept and algorithm: [piXelicidio](https://github.com/piXelicidio)
- Rewrite and modernization: This project

## References

- [Stigmergy](https://en.wikipedia.org/wiki/Stigmergy) - Indirect coordination mechanism
- [Ant Colony Optimization](https://en.wikipedia.org/wiki/Ant_colony_optimization_algorithms) - Related optimization algorithms
- [LÖVE 2D](https://love2d.org/) - Original framework
