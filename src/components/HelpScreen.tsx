import { POWERUP_REGISTRY } from '../powerups';

interface HelpScreenProps {
  onBack: () => void;
}

export function HelpScreen({ onBack }: HelpScreenProps) {
  const powerups = Array.from(POWERUP_REGISTRY.values());

  return (
    <div className="help-screen">
      <h1 className="help-title">Help</h1>

      <div className="help-section">
        <h2 className="help-section-title">Controls</h2>
        <ul className="help-list">
          <li><span className="help-key">Arrow keys</span> or <span className="help-key">W A S D</span> — Move the snake</li>
          <li><span className="help-key">P</span> — Pause / unpause the game</li>
          <li><span className="help-key">Esc</span> — Pause with option to quit</li>
        </ul>
      </div>

      <div className="help-section">
        <h2 className="help-section-title">Powerups</h2>
        <div className="help-powerup-list">
          {powerups.map((def) => (
            <div key={def.type} className="help-powerup-item">
              <span className="help-powerup-icon" style={{ backgroundColor: def.color }}>
                {def.icon}
              </span>
              <div>
                <span className="help-powerup-name">{def.label}</span>
                <span className="help-powerup-desc">{getPowerupDescription(def.type)}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      <button className="help-back-button" onClick={onBack}>
        Back to main
      </button>
    </div>
  );
}

function getPowerupDescription(type: string): string {
  switch (type) {
    case 'SLOW_MOTION':
      return 'Slows the game down for 5 seconds.';
    case 'GHOST_MODE':
      return 'Pass through your own body for 5 seconds.';
    case 'SHIELD':
      return 'Survive one collision with a wall or yourself.';
    case 'DOUBLE_POINTS':
      return 'Apples are worth 2 points for 20 seconds.';
    case 'APPLE_MAGNET':
      return 'Pulls the apple toward your head when within 3 cells.';
    case 'BOMB':
      return 'Press Space to destroy the apple and respawn it elsewhere. Lost when another powerup is picked up.';
    default:
      return '';
  }
}
