import { type ReactElement, useEffect } from 'react';
import { Direction, type Position } from '../types';
import { COLORS, GRID_HEIGHT, GRID_WIDTH } from '../constants';

interface GameBoardProps {
  snake: Position[];
  apple: Position;
  score: number;
  onDirectionChange: (dir: Direction) => void;
  onPause: () => void;
}

function getCellColor(x: number, y: number, snake: Position[], apple: Position): string {
  if (apple.x === x && apple.y === y) return COLORS.apple;
  for (let i = 0; i < snake.length; i++) {
    if (snake[i].x === x && snake[i].y === y) {
      return i === 0 ? COLORS.snakeHead : COLORS.snakeBody;
    }
  }
  return COLORS.freeSpace;
}

export function GameBoard({ snake, apple, score, onDirectionChange, onPause }: GameBoardProps) {
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      switch (e.key) {
        case 'ArrowUp':
        case 'w':
        case 'W':
          e.preventDefault();
          onDirectionChange(Direction.UP);
          break;
        case 'ArrowDown':
        case 's':
        case 'S':
          e.preventDefault();
          onDirectionChange(Direction.DOWN);
          break;
        case 'ArrowLeft':
        case 'a':
        case 'A':
          e.preventDefault();
          onDirectionChange(Direction.LEFT);
          break;
        case 'ArrowRight':
        case 'd':
        case 'D':
          e.preventDefault();
          onDirectionChange(Direction.RIGHT);
          break;
        case 'Escape':
          onPause();
          break;
      }
    }

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onDirectionChange, onPause]);

  const cells: ReactElement[] = [];
  for (let y = 0; y < GRID_HEIGHT; y++) {
    for (let x = 0; x < GRID_WIDTH; x++) {
      const color = getCellColor(x, y, snake, apple);
      cells.push(
        <div
          key={`${x}-${y}`}
          className="cell"
          style={{ backgroundColor: color }}
        />,
      );
    }
  }

  return (
    <div className="game-board-container">
      <div className="scoreboard">Score: {score}</div>
      <div className="board-border">
        <div
          className="game-grid"
          style={{
            gridTemplateColumns: `repeat(${GRID_WIDTH}, 1fr)`,
            gridTemplateRows: `repeat(${GRID_HEIGHT}, 1fr)`,
          }}
        >
          {cells}
        </div>
      </div>
    </div>
  );
}
