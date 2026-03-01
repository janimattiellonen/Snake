import { useCallback, useEffect, useRef, useState } from 'react';
import { Direction, GameState, type Position } from './types';
import {
  GRID_HEIGHT,
  GRID_WIDTH,
  TICK_SPEED,
  POWERUP_SPAWN_INTERVAL,
  POWERUP_DESPAWN_TIME,
  POWERUP_MAX_ON_GRID,
  POWERUP_SPAWN_CHANCE,
} from './constants';
import {
  type ActiveEffect,
  type EffectContext,
  type GridPowerup,
  POWERUP_REGISTRY,
  getDefaultModifiers,
  pickWeightedPowerupType,
} from './powerups';

function getRandomStartPosition(): Position {
  return {
    x: Math.floor(GRID_WIDTH / 2) + Math.floor(Math.random() * 3) - 1,
    y: Math.floor(GRID_HEIGHT / 2) + Math.floor(Math.random() * 3) - 1,
  };
}

function placeApple(snake: Position[]): Position {
  const occupied = new Set(snake.map((s) => `${s.x},${s.y}`));
  const freeCells: Position[] = [];
  for (let x = 0; x < GRID_WIDTH; x++) {
    for (let y = 0; y < GRID_HEIGHT; y++) {
      if (!occupied.has(`${x},${y}`)) {
        freeCells.push({ x, y });
      }
    }
  }
  return freeCells[Math.floor(Math.random() * freeCells.length)];
}

function placePowerup(snake: Position[], apple: Position, gridPowerups: GridPowerup[]): Position {
  const occupied = new Set(snake.map((s) => `${s.x},${s.y}`));
  occupied.add(`${apple.x},${apple.y}`);
  for (const gp of gridPowerups) {
    occupied.add(`${gp.position.x},${gp.position.y}`);
  }
  const freeCells: Position[] = [];
  for (let x = 0; x < GRID_WIDTH; x++) {
    for (let y = 0; y < GRID_HEIGHT; y++) {
      if (!occupied.has(`${x},${y}`)) {
        freeCells.push({ x, y });
      }
    }
  }
  return freeCells[Math.floor(Math.random() * freeCells.length)];
}

function moveHead(head: Position, direction: Direction): Position {
  switch (direction) {
    case Direction.UP:
      return { x: head.x, y: head.y - 1 };
    case Direction.DOWN:
      return { x: head.x, y: head.y + 1 };
    case Direction.LEFT:
      return { x: head.x - 1, y: head.y };
    case Direction.RIGHT:
      return { x: head.x + 1, y: head.y };
  }
}

function isOpposite(a: Direction, b: Direction): boolean {
  return (
    (a === Direction.UP && b === Direction.DOWN) ||
    (a === Direction.DOWN && b === Direction.UP) ||
    (a === Direction.LEFT && b === Direction.RIGHT) ||
    (a === Direction.RIGHT && b === Direction.LEFT)
  );
}

function checkWallCollision(head: Position): boolean {
  return head.x < 0 || head.x >= GRID_WIDTH || head.y < 0 || head.y >= GRID_HEIGHT;
}

function checkSelfCollision(head: Position, body: Position[]): boolean {
  return body.some((s) => s.x === head.x && s.y === head.y);
}

export interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  spawnTime: number;
  color?: string;
}

const PARTICLE_COUNT = 8;
const PARTICLE_LIFETIME = 400;

function spawnParticles(cellX: number, cellY: number, now: number, color?: string): Particle[] {
  const particles: Particle[] = [];
  for (let i = 0; i < PARTICLE_COUNT; i++) {
    const angle = (Math.PI * 2 * i) / PARTICLE_COUNT + (Math.random() - 0.5) * 0.5;
    const speed = 1.5 + Math.random() * 2;
    particles.push({
      x: cellX + 0.5,
      y: cellY + 0.5,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed,
      spawnTime: now,
      color,
    });
  }
  return particles;
}

export interface RenderState {
  snake: Position[];
  prevSnake: Position[];
  apple: Position;
  lastTickTime: number;
  particles: Particle[];
  gridPowerups: GridPowerup[];
  activeEffects: ActiveEffect[];
}

export { PARTICLE_LIFETIME };

export function useSnakeGame() {
  const [gameState, setGameState] = useState<GameState>(GameState.TITLE);
  const [score, setScore] = useState(0);
  const [tickSpeedTrigger, setTickSpeedTrigger] = useState(0);

  const renderStateRef = useRef<RenderState>({
    snake: [],
    prevSnake: [],
    apple: { x: 0, y: 0 },
    lastTickTime: 0,
    particles: [],
    gridPowerups: [],
    activeEffects: [],
  });
  const directionRef = useRef<Direction>(Direction.RIGHT);
  const directionQueueRef = useRef<Direction[]>([]);
  const lastPowerupSpawnCheckRef = useRef(0);
  const effectiveTickSpeedRef = useRef(TICK_SPEED);

  const startGame = useCallback(() => {
    const startPos = getRandomStartPosition();
    const initialSnake = [startPos];
    const initialApple = placeApple(initialSnake);
    directionRef.current = Direction.RIGHT;
    directionQueueRef.current = [];
    lastPowerupSpawnCheckRef.current = performance.now();
    effectiveTickSpeedRef.current = TICK_SPEED;
    renderStateRef.current = {
      snake: initialSnake,
      prevSnake: initialSnake,
      apple: initialApple,
      lastTickTime: performance.now(),
      particles: [],
      gridPowerups: [],
      activeEffects: [],
    };
    setScore(0);
    setTickSpeedTrigger(0);
    setGameState(GameState.PLAYING);
  }, []);

  const togglePause = useCallback(() => {
    setGameState((prev) => {
      if (prev === GameState.PLAYING) return GameState.PAUSED;
      if (prev === GameState.PAUSED) {
        renderStateRef.current.lastTickTime = performance.now();
        return GameState.PLAYING;
      }
      return prev;
    });
  }, []);

  const simplePause = useCallback(() => {
    setGameState((prev) => {
      if (prev === GameState.PLAYING) return GameState.SIMPLE_PAUSED;
      return prev;
    });
  }, []);

  const simpleResume = useCallback(() => {
    setGameState((prev) => {
      if (prev === GameState.SIMPLE_PAUSED) {
        renderStateRef.current.lastTickTime = performance.now();
        return GameState.PLAYING;
      }
      return prev;
    });
  }, []);

  const quitGame = useCallback(() => {
    setGameState(GameState.TITLE);
  }, []);

  const changeDirection = useCallback((newDir: Direction) => {
    directionQueueRef.current.push(newDir);
  }, []);

  // Game loop
  useEffect(() => {
    if (gameState !== GameState.PLAYING) return;

    const interval = setInterval(() => {
      const rs = renderStateRef.current;
      const now = performance.now();

      // --- Powerup spawn / despawn ---
      // Despawn expired grid powerups
      rs.gridPowerups = rs.gridPowerups.filter((gp) => now - gp.spawnTime < gp.lifetime);

      // Spawn check
      if (now - lastPowerupSpawnCheckRef.current >= POWERUP_SPAWN_INTERVAL) {
        lastPowerupSpawnCheckRef.current = now;
        if (rs.gridPowerups.length < POWERUP_MAX_ON_GRID && Math.random() < POWERUP_SPAWN_CHANCE) {
          const type = pickWeightedPowerupType();
          const pos = placePowerup(rs.snake, rs.apple, rs.gridPowerups);
          if (pos) {
            rs.gridPowerups.push({
              type,
              position: pos,
              spawnTime: now,
              lifetime: POWERUP_DESPAWN_TIME,
            });
          }
        }
      }

      // --- Process direction queue ---
      let currentDir = directionRef.current;
      while (directionQueueRef.current.length > 0) {
        const nextDir = directionQueueRef.current.shift()!;
        if (!isOpposite(currentDir, nextDir)) {
          currentDir = nextDir;
          break;
        }
      }
      directionRef.current = currentDir;

      const snakeNow = rs.snake;
      const newHead = moveHead(snakeNow[0], currentDir);

      // --- Expire active effects and build modifiers ---
      const modifiers = getDefaultModifiers();
      const stillActive: ActiveEffect[] = [];
      for (const effect of rs.activeEffects) {
        if (effect.duration !== Infinity && now - effect.startTime >= effect.duration) {
          const def = POWERUP_REGISTRY.get(effect.type);
          if (def?.onDeactivate) {
            const ctx: EffectContext = {
              snake: snakeNow,
              score: 0,
              deactivateSelf: () => {},
              spawnParticles: (x, y, color) => {
                rs.particles.push(...spawnParticles(x, y, now, color));
              },
            };
            def.onDeactivate(effect.effectState, ctx);
          }
          continue;
        }
        stillActive.push(effect);
      }
      rs.activeEffects = stillActive;

      // Apply onTick for each active effect
      for (const effect of rs.activeEffects) {
        const def = POWERUP_REGISTRY.get(effect.type);
        if (def?.onTick) {
          const ctx: EffectContext = {
            snake: snakeNow,
            score: 0,
            deactivateSelf: () => {
              rs.activeEffects = rs.activeEffects.filter((e) => e !== effect);
            },
            spawnParticles: (x, y, color) => {
              rs.particles.push(...spawnParticles(x, y, now, color));
            },
          };
          def.onTick(modifiers, effect.effectState, ctx);
        }
      }

      // --- Powerup pickup (check before collision so shield can apply) ---
      const pickedIndex = rs.gridPowerups.findIndex(
        (gp) => gp.position.x === newHead.x && gp.position.y === newHead.y,
      );
      if (pickedIndex !== -1) {
        const picked = rs.gridPowerups[pickedIndex];
        rs.gridPowerups.splice(pickedIndex, 1);
        const def = POWERUP_REGISTRY.get(picked.type)!;

        let selfDeactivated = false;
        const effectCtx: EffectContext = {
          snake: snakeNow,
          score: 0,
          deactivateSelf: () => {
            selfDeactivated = true;
          },
          spawnParticles: (x, y, color) => {
            rs.particles.push(...spawnParticles(x, y, now, color));
          },
        };

        const effectState = def.onActivate(effectCtx);
        if (!selfDeactivated) {
          const newEffect: ActiveEffect = {
            type: picked.type,
            startTime: now,
            duration: def.duration ?? 0,
            effectState,
          };
          rs.activeEffects.push(newEffect);

          // Apply this new effect's onTick immediately so it counts this tick
          if (def.onTick) {
            const tickCtx: EffectContext = {
              snake: snakeNow,
              score: 0,
              deactivateSelf: () => {
                rs.activeEffects = rs.activeEffects.filter((e) => e !== newEffect);
              },
              spawnParticles: (x, y, color) => {
                rs.particles.push(...spawnParticles(x, y, now, color));
              },
            };
            def.onTick(modifiers, newEffect.effectState, tickCtx);
          }
        }

        // Spawn pickup particles
        rs.particles.push(...spawnParticles(picked.position.x, picked.position.y, now, def.particleColor));
      }

      // --- Collision detection ---
      const wallHit = checkWallCollision(newHead);
      const selfHit = modifiers.ghostMode ? false : checkSelfCollision(newHead, snakeNow);

      if (wallHit || selfHit) {
        const collisionType: 'wall' | 'self' = wallHit ? 'wall' : 'self';
        let cancelled = false;

        // Check if any active effect can cancel the collision
        for (const effect of [...rs.activeEffects]) {
          const def = POWERUP_REGISTRY.get(effect.type);
          if (def?.onCollision) {
            const ctx: EffectContext = {
              snake: snakeNow,
              score: 0,
              deactivateSelf: () => {
                rs.activeEffects = rs.activeEffects.filter((e) => e !== effect);
              },
              spawnParticles: (x, y, color) => {
                rs.particles.push(...spawnParticles(x, y, now, color));
              },
            };
            if (def.onCollision(collisionType, effect.effectState, ctx)) {
              cancelled = true;
              break;
            }
          }
        }

        if (!cancelled) {
          setGameState(GameState.GAME_OVER);
          return;
        }

        // If collision was cancelled (shield), don't move into the wall — stay in place
        if (wallHit) {
          // Don't move; keep snake as-is this tick
          rs.lastTickTime = now;
          rs.particles = rs.particles.filter((p) => now - p.spawnTime < PARTICLE_LIFETIME);

          // Update tick speed
          const newSpeed = modifiers.tickSpeed ?? TICK_SPEED;
          if (newSpeed !== effectiveTickSpeedRef.current) {
            effectiveTickSpeedRef.current = newSpeed;
            setTickSpeedTrigger((t) => t + 1);
          }
          return;
        }
      }

      // Filter out expired particles
      const liveParticles = rs.particles.filter((p) => now - p.spawnTime < PARTICLE_LIFETIME);

      if (newHead.x === rs.apple.x && newHead.y === rs.apple.y) {
        const grownSnake = [newHead, ...snakeNow];
        const newApple = placeApple(grownSnake);
        const newParticles = [...liveParticles, ...spawnParticles(rs.apple.x, rs.apple.y, now)];
        renderStateRef.current = {
          ...rs,
          snake: grownSnake,
          prevSnake: snakeNow,
          apple: newApple,
          lastTickTime: now,
          particles: newParticles,
        };
        const points = Math.round(1 * modifiers.scoreMultiplier);
        setScore((s) => s + points);
      } else {
        const movedSnake = [newHead, ...snakeNow.slice(0, -1)];
        renderStateRef.current = {
          ...rs,
          snake: movedSnake,
          prevSnake: snakeNow,
          apple: rs.apple,
          lastTickTime: now,
          particles: liveParticles,
        };
      }

      // Dynamic tick speed
      const newSpeed = modifiers.tickSpeed ?? TICK_SPEED;
      if (newSpeed !== effectiveTickSpeedRef.current) {
        effectiveTickSpeedRef.current = newSpeed;
        setTickSpeedTrigger((t) => t + 1);
      }
    }, effectiveTickSpeedRef.current);

    return () => clearInterval(interval);
  }, [gameState, tickSpeedTrigger]);

  return {
    gameState,
    score,
    renderStateRef,
    startGame,
    togglePause,
    simplePause,
    simpleResume,
    quitGame,
    changeDirection,
  };
}
