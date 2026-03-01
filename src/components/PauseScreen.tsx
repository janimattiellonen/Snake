import { useEffect } from 'react';
import { POWERUP_REGISTRY, type PowerupType } from '../powerups';

interface PauseScreenProps {
  onResume: () => void;
  onSpawnPowerup: (type: PowerupType) => void;
}

export function PauseScreen({ onResume, onSpawnPowerup }: PauseScreenProps) {
  const powerups = Array.from(POWERUP_REGISTRY.values());

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === 'p' || e.key === 'P' || e.key === 'Escape') {
        onResume();
        return;
      }
      const num = parseInt(e.key, 10);
      if (num >= 1 && num <= powerups.length) {
        onSpawnPowerup(powerups[num - 1].type);
        onResume();
      }
    }

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onResume, onSpawnPowerup, powerups]);

  function handleSelectPowerup(e: React.MouseEvent, type: PowerupType) {
    e.stopPropagation();
    onSpawnPowerup(type);
    onResume();
  }

  return (
    <div className="overlay" onClick={onResume}>
      <div className="game-over-dialog" onClick={(e) => e.stopPropagation()}>
        <h2 className="pause-text">PAUSED!</h2>
        <p className="pause-hint">Press <span className="help-key">P</span> or <span className="help-key">Esc</span> key or click mouse to continue</p>

        <div className="pause-powerups">
          <p className="pause-powerups-title">Spawn powerup</p>
          <div className="pause-powerups-list">
            {powerups.map((def, i) => (
              <button
                key={def.type}
                className="powerups-menu-item"
                onClick={(e) => handleSelectPowerup(e, def.type)}
              >
                <span className="powerups-menu-index">({i + 1})</span>
                <span className="help-powerup-icon" style={{ backgroundColor: def.color }}>
                  {def.icon}
                </span>
                <span className="help-powerup-name">{def.label}</span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
