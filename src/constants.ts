export const GRID_WIDTH = 20;
export const GRID_HEIGHT = 20;
export const CELL_SIZE = 25;
export const TICK_SPEED = 150;

export const COLORS = {
  edge: '#181717',
  apple: '#800000',
  snakeHead: '#2704ed',
  snakeBody: '#49bd07',
  freeSpace: '#f3ecec',
} as const;

export const POWERUP_SPAWN_INTERVAL = 8000;
export const POWERUP_DESPAWN_TIME = 10000;
export const POWERUP_MAX_ON_GRID = 2;
export const POWERUP_SPAWN_CHANCE = 0.4;
