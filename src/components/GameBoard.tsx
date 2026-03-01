import { type RefObject, useEffect, useRef } from 'react';
import { Direction } from '../types';
import { COLORS, GRID_HEIGHT, GRID_WIDTH, TICK_SPEED } from '../constants';
import { PARTICLE_LIFETIME, type RenderState } from '../useSnakeGame';
import { POWERUP_REGISTRY, PowerupType } from '../powerups';

interface GameBoardProps {
  score: number;
  renderStateRef: RefObject<RenderState>;
  onDirectionChange: (dir: Direction) => void;
  onPause: () => void;
  onSimplePause: () => void;
}

const BORDER_PX = 4;

function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * t;
}

export function GameBoard({ score, renderStateRef, onDirectionChange, onPause, onSimplePause }: GameBoardProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Animation loop — reads directly from renderStateRef, no React state in the hot path
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let rafId: number;
    let cachedWidth = 0;
    let cachedHeight = 0;

    function resize() {
      const container = containerRef.current;
      if (!container || !canvas) return;
      const rect = container.getBoundingClientRect();
      const dpr = window.devicePixelRatio || 1;
      cachedWidth = rect.width;
      cachedHeight = rect.height;
      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;
      canvas.style.width = `${rect.width}px`;
      canvas.style.height = `${rect.height}px`;
      ctx!.setTransform(dpr, 0, 0, dpr, 0, 0);
    }

    resize();
    const observer = new ResizeObserver(resize);
    observer.observe(containerRef.current!);

    function loop() {
      const rs = renderStateRef.current;
      const width = cachedWidth;
      const height = cachedHeight;

      const gridW = width - BORDER_PX * 2;
      const gridH = height - BORDER_PX * 2;
      const cellW = gridW / GRID_WIDTH;
      const cellH = gridH / GRID_HEIGHT;

      // Interpolation progress
      const elapsed = performance.now() - rs.lastTickTime;
      const progress = Math.min(elapsed / TICK_SPEED, 1);

      const now = performance.now();

      // Border
      ctx!.fillStyle = COLORS.edge;
      ctx!.fillRect(0, 0, width, height);

      // Background
      ctx!.fillStyle = COLORS.freeSpace;
      ctx!.fillRect(BORDER_PX, BORDER_PX, gridW, gridH);

      // Apple
      ctx!.fillStyle = COLORS.apple;
      ctx!.fillRect(
        BORDER_PX + rs.apple.x * cellW,
        BORDER_PX + rs.apple.y * cellH,
        cellW,
        cellH,
      );

      // --- Grid powerups ---
      for (const gp of rs.gridPowerups) {
        const def = POWERUP_REGISTRY.get(gp.type);
        if (!def) continue;

        const age = now - gp.spawnTime;
        const lifeRatio = age / gp.lifetime;

        // Pulsing animation
        const pulse = 0.8 + 0.2 * Math.sin(now * 0.005);

        // Blink when about to despawn (last 20%)
        let visible = true;
        if (lifeRatio > 0.8) {
          visible = Math.sin(now * 0.02) > 0;
        }

        if (visible) {
          const px = BORDER_PX + gp.position.x * cellW;
          const py = BORDER_PX + gp.position.y * cellH;
          const inset = cellW * (1 - pulse) * 0.5;

          ctx!.globalAlpha = 0.85;
          ctx!.fillStyle = def.color;
          ctx!.fillRect(px + inset, py + inset, cellW * pulse, cellH * pulse);
          ctx!.globalAlpha = 1;

          // Draw icon letter
          ctx!.fillStyle = '#ffffff';
          ctx!.font = `bold ${Math.round(cellW * 0.6)}px monospace`;
          ctx!.textAlign = 'center';
          ctx!.textBaseline = 'middle';
          ctx!.fillText(def.icon, px + cellW / 2, py + cellH / 2);
        }
      }

      // --- Snake with interpolation ---
      const { snake, prevSnake } = rs;
      const hasGhost = rs.activeEffects.some((e) => e.type === PowerupType.GHOST_MODE);
      const hasShield = rs.activeEffects.some((e) => e.type === PowerupType.SHIELD);

      for (let i = 0; i < snake.length; i++) {
        const curr = snake[i];
        const prev = i < prevSnake.length ? prevSnake[i] : curr;

        const renderX = lerp(prev.x, curr.x, progress);
        const renderY = lerp(prev.y, curr.y, progress);

        // Ghost mode: body segments semi-transparent
        if (hasGhost && i > 0) {
          ctx!.globalAlpha = 0.35;
        }

        ctx!.fillStyle = i === 0 ? COLORS.snakeHead : COLORS.snakeBody;
        ctx!.fillRect(
          BORDER_PX + renderX * cellW,
          BORDER_PX + renderY * cellH,
          cellW,
          cellH,
        );

        ctx!.globalAlpha = 1;

        // Shield glow on head
        if (hasShield && i === 0) {
          ctx!.strokeStyle = '#ffdd44';
          ctx!.lineWidth = 2.5;
          ctx!.strokeRect(
            BORDER_PX + renderX * cellW - 1,
            BORDER_PX + renderY * cellH - 1,
            cellW + 2,
            cellH + 2,
          );
        }
      }

      // --- Particles (with per-particle color) ---
      for (const p of rs.particles) {
        const age = now - p.spawnTime;
        if (age >= PARTICLE_LIFETIME) continue;
        const t = age / PARTICLE_LIFETIME;
        const alpha = 1 - t;
        const size = cellW * 0.35 * (1 - t * 0.6);
        const px = BORDER_PX + (p.x + p.vx * t) * cellW;
        const py = BORDER_PX + (p.y + p.vy * t) * cellH;
        ctx!.globalAlpha = alpha;
        ctx!.fillStyle = p.color ?? COLORS.apple;
        ctx!.fillRect(px - size / 2, py - size / 2, size, size);
      }
      ctx!.globalAlpha = 1;

      // --- Active effects HUD (top-right) ---
      const timedEffects = rs.activeEffects.filter(
        (e) => e.duration !== Infinity,
      );
      if (timedEffects.length > 0) {
        const hudX = width - 10;
        let hudY = 12;
        const barWidth = 100;
        const barHeight = 12;

        for (const effect of timedEffects) {
          const def = POWERUP_REGISTRY.get(effect.type);
          if (!def) continue;

          const elapsed = now - effect.startTime;
          const remaining = Math.max(0, 1 - elapsed / effect.duration);

          // Background bar
          ctx!.fillStyle = 'rgba(0, 0, 0, 0.4)';
          ctx!.fillRect(hudX - barWidth, hudY, barWidth, barHeight);

          // Filled portion
          ctx!.fillStyle = def.color;
          ctx!.fillRect(hudX - barWidth, hudY, barWidth * remaining, barHeight);

          // Label
          ctx!.fillStyle = '#ffffff';
          ctx!.font = `bold 10px sans-serif`;
          ctx!.textAlign = 'right';
          ctx!.textBaseline = 'top';
          ctx!.fillText(def.label, hudX - barWidth - 4, hudY + 1);

          hudY += barHeight + 4;
        }
      }

      rafId = requestAnimationFrame(loop);
    }
    rafId = requestAnimationFrame(loop);

    return () => {
      cancelAnimationFrame(rafId);
      observer.disconnect();
    };
  }, [renderStateRef]);

  // Keyboard input
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
        case 'p':
        case 'P':
          onSimplePause();
          break;
      }
    }

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onDirectionChange, onPause, onSimplePause]);

  return (
    <div className="game-board-container">
      <div className="scoreboard">Score: {score}</div>
      <div className="canvas-wrapper" ref={containerRef}>
        <canvas ref={canvasRef} className="game-canvas-element" />
      </div>
    </div>
  );
}
