import { useCallback, useEffect, useRef, useState } from 'react';
import { Direction, GameState, type Position } from './types';
import { GRID_HEIGHT, GRID_WIDTH, TICK_SPEED } from './constants';

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
}

const PARTICLE_COUNT = 8;
const PARTICLE_LIFETIME = 400;

function spawnParticles(cellX: number, cellY: number, now: number): Particle[] {
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
}

export { PARTICLE_LIFETIME };

export function useSnakeGame() {
  const [gameState, setGameState] = useState<GameState>(GameState.TITLE);
  const [score, setScore] = useState(0);

  const renderStateRef = useRef<RenderState>({
    snake: [],
    prevSnake: [],
    apple: { x: 0, y: 0 },
    lastTickTime: 0,
    particles: [],
  });
  const directionRef = useRef<Direction>(Direction.RIGHT);
  const directionQueueRef = useRef<Direction[]>([]);

  const startGame = useCallback(() => {
    const startPos = getRandomStartPosition();
    const initialSnake = [startPos];
    const initialApple = placeApple(initialSnake);
    directionRef.current = Direction.RIGHT;
    directionQueueRef.current = [];
    renderStateRef.current = {
      snake: initialSnake,
      prevSnake: initialSnake,
      apple: initialApple,
      lastTickTime: performance.now(),
      particles: [],
    };
    setScore(0);
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

      // Process direction queue
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

      if (checkWallCollision(newHead) || checkSelfCollision(newHead, snakeNow)) {
        setGameState(GameState.GAME_OVER);
        return;
      }

      const now = performance.now();

      // Filter out expired particles
      const liveParticles = rs.particles.filter((p) => now - p.spawnTime < PARTICLE_LIFETIME);

      if (newHead.x === rs.apple.x && newHead.y === rs.apple.y) {
        const grownSnake = [newHead, ...snakeNow];
        const newApple = placeApple(grownSnake);
        const newParticles = [...liveParticles, ...spawnParticles(rs.apple.x, rs.apple.y, now)];
        renderStateRef.current = {
          snake: grownSnake,
          prevSnake: snakeNow,
          apple: newApple,
          lastTickTime: now,
          particles: newParticles,
        };
        setScore((s) => s + 1);
      } else {
        const movedSnake = [newHead, ...snakeNow.slice(0, -1)];
        renderStateRef.current = {
          snake: movedSnake,
          prevSnake: snakeNow,
          apple: rs.apple,
          lastTickTime: now,
          particles: liveParticles,
        };
      }
    }, TICK_SPEED);

    return () => clearInterval(interval);
  }, [gameState]);

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
