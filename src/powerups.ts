import type { Position } from './types';

export const PowerupType = {
  SLOW_MOTION: 'SLOW_MOTION',
  GHOST_MODE: 'GHOST_MODE',
  SHIELD: 'SHIELD',
} as const;

export type PowerupType = (typeof PowerupType)[keyof typeof PowerupType];

export interface TickModifiers {
  tickSpeed: number | null;
  ghostMode: boolean;
  shieldActive: boolean;
  scoreMultiplier: number;
}

export interface EffectContext {
  snake: Position[];
  score: number;
  deactivateSelf: () => void;
  spawnParticles: (x: number, y: number, color: string) => void;
}

export interface PowerupDefinition {
  type: PowerupType;
  label: string;
  color: string;
  particleColor: string;
  icon: string;
  spawnWeight: number;
  duration: number | null;
  onActivate: (ctx: EffectContext) => Record<string, unknown>;
  onTick?: (modifiers: TickModifiers, effectState: Record<string, unknown>, ctx: EffectContext) => void;
  onDeactivate?: (effectState: Record<string, unknown>, ctx: EffectContext) => void;
  onCollision?: (
    type: 'wall' | 'self',
    effectState: Record<string, unknown>,
    ctx: EffectContext,
  ) => boolean;
}

export interface GridPowerup {
  type: PowerupType;
  position: Position;
  spawnTime: number;
  lifetime: number;
}

export interface ActiveEffect {
  type: PowerupType;
  startTime: number;
  duration: number;
  effectState: Record<string, unknown>;
}

export const POWERUP_REGISTRY = new Map<PowerupType, PowerupDefinition>([
  [
    PowerupType.SLOW_MOTION,
    {
      type: PowerupType.SLOW_MOTION,
      label: 'Slow Motion',
      color: '#00cccc',
      particleColor: '#00ffff',
      icon: 'S',
      spawnWeight: 1,
      duration: 5000,
      onActivate: () => ({}),
      onTick: (modifiers) => {
        modifiers.tickSpeed = 250;
      },
    },
  ],
  [
    PowerupType.GHOST_MODE,
    {
      type: PowerupType.GHOST_MODE,
      label: 'Ghost Mode',
      color: '#8800cc',
      particleColor: '#cc44ff',
      icon: 'G',
      spawnWeight: 1,
      duration: 5000,
      onActivate: () => ({}),
      onTick: (modifiers) => {
        modifiers.ghostMode = true;
      },
    },
  ],
  [
    PowerupType.SHIELD,
    {
      type: PowerupType.SHIELD,
      label: 'Shield',
      color: '#ccaa00',
      particleColor: '#ffdd44',
      icon: '!',
      spawnWeight: 1,
      duration: Infinity,
      onActivate: () => ({ charges: 1 }),
      onTick: (modifiers) => {
        modifiers.shieldActive = true;
      },
      onCollision: (_type, effectState, ctx) => {
        const charges = (effectState.charges as number) - 1;
        effectState.charges = charges;
        ctx.spawnParticles(ctx.snake[0].x, ctx.snake[0].y, '#ffdd44');
        ctx.deactivateSelf();
        return true;
      },
    },
  ],
]);

export function getDefaultModifiers(): TickModifiers {
  return {
    tickSpeed: null,
    ghostMode: false,
    shieldActive: false,
    scoreMultiplier: 1,
  };
}

export function pickWeightedPowerupType(): PowerupType {
  const entries = Array.from(POWERUP_REGISTRY.values());
  const totalWeight = entries.reduce((sum, e) => sum + e.spawnWeight, 0);
  let roll = Math.random() * totalWeight;
  for (const entry of entries) {
    roll -= entry.spawnWeight;
    if (roll <= 0) return entry.type;
  }
  return entries[entries.length - 1].type;
}
