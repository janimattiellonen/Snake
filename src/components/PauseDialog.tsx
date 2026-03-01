import { useEffect, useRef } from 'react';
import { POWERUP_REGISTRY, type PowerupType } from '../powerups';

interface PauseDialogProps {
  onQuit: () => void;
  onContinue: () => void;
  onSpawnPowerup: (type: PowerupType) => void;
}

export function PauseDialog({ onQuit, onContinue, onSpawnPowerup }: PauseDialogProps) {
  const continueRef = useRef<HTMLButtonElement>(null);
  const powerups = Array.from(POWERUP_REGISTRY.values());

  useEffect(() => {
    continueRef.current?.focus();
  }, []);

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      const num = parseInt(e.key, 10);
      if (num >= 1 && num <= powerups.length) {
        onSpawnPowerup(powerups[num - 1].type);
        onContinue();
      }
    }

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onSpawnPowerup, onContinue, powerups]);

  function handleSelectPowerup(type: PowerupType) {
    onSpawnPowerup(type);
    onContinue();
  }

  return (
    <div className="overlay">
      <div className="pause-dialog">
        <p>Do you want to quit?</p>
        <div className="pause-buttons">
          <button className="quit-button" onClick={onQuit}>
            Quit
          </button>
          <button ref={continueRef} className="continue-button" onClick={onContinue}>
            Continue
          </button>
        </div>

        <div className="pause-powerups">
          <p className="pause-powerups-title">Spawn powerup</p>
          <div className="pause-powerups-list">
            {powerups.map((def, i) => (
              <button
                key={def.type}
                className="powerups-menu-item"
                onClick={() => handleSelectPowerup(def.type)}
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
