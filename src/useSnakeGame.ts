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

interface TickState {
  snake: Position[];
  apple: Position;
  direction: Direction;
  score: number;
}

export function useSnakeGame() {
  const [gameState, setGameState] = useState<GameState>(GameState.TITLE);
  const [snake, setSnake] = useState<Position[]>([]);
  const [apple, setApple] = useState<Position>({ x: 0, y: 0 });
  const [direction, setDirection] = useState<Direction>(Direction.RIGHT);
  const [score, setScore] = useState(0);

  const tickStateRef = useRef<TickState>({ snake: [], apple: { x: 0, y: 0 }, direction: Direction.RIGHT, score: 0 });
  const directionQueueRef = useRef<Direction[]>([]);

  useEffect(() => {
    tickStateRef.current = { snake, apple, direction, score };
  }, [snake, apple, direction, score]);

  const startGame = useCallback(() => {
    const startPos = getRandomStartPosition();
    const initialSnake = [startPos];
    const initialApple = placeApple(initialSnake);
    setSnake(initialSnake);
    setApple(initialApple);
    setDirection(Direction.RIGHT);
    setScore(0);
    directionQueueRef.current = [];
    // Also update ref immediately so the first tick reads correct state
    tickStateRef.current = { snake: initialSnake, apple: initialApple, direction: Direction.RIGHT, score: 0 };
    setGameState(GameState.PLAYING);
  }, []);

  const togglePause = useCallback(() => {
    setGameState((prev) => {
      if (prev === GameState.PLAYING) return GameState.PAUSED;
      if (prev === GameState.PAUSED) return GameState.PLAYING;
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
      const state = tickStateRef.current;

      // Process direction queue
      let currentDir = state.direction;
      while (directionQueueRef.current.length > 0) {
        const nextDir = directionQueueRef.current.shift()!;
        if (!isOpposite(currentDir, nextDir)) {
          currentDir = nextDir;
          break;
        }
      }

      const snakeNow = state.snake;
      const newHead = moveHead(snakeNow[0], currentDir);

      if (checkWallCollision(newHead) || checkSelfCollision(newHead, snakeNow)) {
        setGameState(GameState.GAME_OVER);
        return;
      }

      if (newHead.x === state.apple.x && newHead.y === state.apple.y) {
        const grownSnake = [newHead, ...snakeNow];
        const newScore = state.score + 1;
        const newApple = placeApple(grownSnake);
        tickStateRef.current = { snake: grownSnake, apple: newApple, direction: currentDir, score: newScore };
        setSnake(grownSnake);
        setApple(newApple);
        setScore(newScore);
      } else {
        const movedSnake = [newHead, ...snakeNow.slice(0, -1)];
        tickStateRef.current = { ...state, snake: movedSnake, direction: currentDir };
        setSnake(movedSnake);
      }

      if (currentDir !== state.direction) {
        setDirection(currentDir);
      }
    }, TICK_SPEED);

    return () => clearInterval(interval);
  }, [gameState]);

  return {
    gameState,
    snake,
    apple,
    direction,
    score,
    startGame,
    togglePause,
    quitGame,
    changeDirection,
  };
}
