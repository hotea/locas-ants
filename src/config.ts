export const CONFIG = {
  antCount: 500,
  gridSize: 16,

  // 速度控制 - 调整这个值来加速/减速模拟
  simulationSpeed: 1,  // 每帧更新次数，2 = 2倍速，0.5 = 半速

  // 蚂蚁运动参数
  antMaxSpeed: 1.2,
  antAcceleration: 0.04,
  antFriction: 0.98,
  antErratic: 0.2,
  antSightDistance: 30,
  antSightAngle: Math.PI / 6,

  positionMemorySize: 10,
  communicateIntervalMin: 3,
  communicateIntervalMax: 13,
  worldWidth: 896,  // 56 * 16 - divisible by gridSize
  worldHeight: 608, // 38 * 16 - divisible by gridSize
  pheromoneDecayTime: 600,
  grassFriction: 0.8,
};

// 运行时可调整的设置
export const SETTINGS = {
  showPheromones: true,
  simulationSpeed: 1,
  antCount: 500,
};
