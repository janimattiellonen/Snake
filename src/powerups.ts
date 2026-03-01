import type { Position } from './types';

export const PowerupType = {
  SLOW_MOTION: 'SLOW_MOTION',
  GHOST_MODE: 'GHOST_MODE',
  SHIELD: 'SHIELD',
  DOUBLE_POINTS: 'DOUBLE_POINTS',
  APPLE_MAGNET: 'APPLE_MAGNET',
  BOMB: 'BOMB',
} as const;

export type PowerupType = (typeof PowerupType)[keyof typeof PowerupType];

export interface TickModifiers {
  tickSpeed: number | null;
  ghostMode: boolean;
  shieldActive: boolean;
  scoreMultiplier: number;
  appleMagnet: boolean;
  bombReady: boolean;
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

/**
 * Spawn probability scale.
 * Higher weight = more likely to appear.
 */
export const SpawnChance = {
  VERY_LOW: 1,
  LOW: 2,
  MEDIUM: 4,
  HIGH: 6,
  VERY_HIGH: 8,
} as const;

export const POWERUP_REGISTRY = new Map<PowerupType, PowerupDefinition>([
  [
    PowerupType.SLOW_MOTION,
    {
      type: PowerupType.SLOW_MOTION,
      label: 'Slow Motion',
      color: '#00cccc',
      particleColor: '#00ffff',
      icon: 'S',
      spawnWeight: SpawnChance.VERY_HIGH,
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
      spawnWeight: SpawnChance.HIGH,
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
      spawnWeight: SpawnChance.HIGH,
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
  [
    PowerupType.DOUBLE_POINTS,
    {
      type: PowerupType.DOUBLE_POINTS,
      label: 'Double Points',
      color: '#ee4444',
      particleColor: '#ff6666',
      icon: '2',
      spawnWeight: SpawnChance.LOW,
      duration: 20000,
      onActivate: () => ({}),
      onTick: (modifiers) => {
        modifiers.scoreMultiplier *= 2;
      },
    },
  ],
  [
    PowerupType.APPLE_MAGNET,
    {
      type: PowerupType.APPLE_MAGNET,
      label: 'Apple Magnet',
      color: '#ff6600',
      particleColor: '#ff9944',
      icon: 'M',
      spawnWeight: SpawnChance.VERY_LOW,
      duration: Infinity,
      onActivate: () => ({ charges: 1 }),
      onTick: (modifiers, effectState) => {
        if ((effectState.charges as number) > 0) {
          modifiers.appleMagnet = true;
        }
      },
    },
  ],
  [
    PowerupType.BOMB,
    {
      type: PowerupType.BOMB,
      label: 'Bomb',
      color: '#ff2222',
      particleColor: '#ff4444',
      icon: 'B',
      spawnWeight: SpawnChance.LOW,
      duration: Infinity,
      onActivate: () => ({ ready: true }),
      onTick: (modifiers, effectState) => {
        if (effectState.ready) {
          modifiers.bombReady = true;
        }
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
    appleMagnet: false,
    bombReady: false,
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
