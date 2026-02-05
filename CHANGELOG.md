# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.0.0] - 2024-02-05

### Added
- Complete rewrite from Lua + LÖVE 2D to TypeScript + Canvas
- Pheromone-based pathfinding algorithm (original implementation preserved)
- Position memory queue system for breadcrumb trails
- Grid-based spatial partitioning (16×16 pixels)
- Interactive tools:
  - Pan/drag viewport
  - Place blocks (obstacles)
  - Place grass (friction modifier)
  - Place caves (ant nests)
  - Place food sources
  - Place portals (automatic pairing)
  - Remove cells
- Camera controls:
  - Mouse drag to pan
  - Mouse wheel to zoom
- Runtime settings panel:
  - Adjustable simulation speed (0.5x - 5x)
  - Dynamic ant count (100 - 5000)
  - Pheromone visualization toggle
  - Language switcher (Chinese/English)
- Bilingual UI (i18n support)
- Performance optimizations:
  - Viewport culling
  - O(1) entity management with linked lists
  - Efficient pheromone updates (3-13 frame intervals)
- Statistics display:
  - FPS counter
  - Ant count
  - Food deposited counter
- Ant behaviors:
  - Random walk with erratic movement
  - Obstacle avoidance (30px forward vision, ±30° left/right)
  - Wall sliding on collision
  - Task switching (food ↔ cave)
  - Pheromone reading and writing
- Cell types:
  - Food sources (configurable storage)
  - Caves (ant nests, food collection)
  - Grass (reduces friction to 0.8)
  - Obstacles (blocks movement)
  - Portals (teleportation with cooldown)

### Technical Details
- Entity-Component System architecture
- TypeScript with strict type checking
- Vite for fast development and optimized builds
- Custom Canvas-based UI system
- Vector math utilities
- Angle normalization and math helpers

### Original Project
- Based on [piXelicidio/locas-ants](https://github.com/piXelicidio/locas-ants)
- Core algorithm preserved with modernized implementation
- Platform migration: Lua + LÖVE → TypeScript + Browser

---

## Future Plans

### Potential Features (not yet implemented)
- [ ] Save/load world states
- [ ] Replay system
- [ ] More cell types (water, fire, etc.)
- [ ] Ant types with different behaviors
- [ ] Colony statistics and graphs
- [ ] Touch controls for mobile
- [ ] WebGL renderer option
- [ ] Multiplayer mode
- [ ] Level editor
- [ ] Achievements system

### Known Issues
- None at release

---

For older versions and detailed commit history, see the [Git log](https://github.com/hotea/locas-ants/commits).
