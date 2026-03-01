interface SettingsScreenProps {
  darkMode: boolean;
  onDarkModeChange: (enabled: boolean) => void;
  onBack: () => void;
}

export function SettingsScreen({ darkMode, onDarkModeChange, onBack }: SettingsScreenProps) {
  return (
    <div className="help-screen">
      <h1 className="help-title">Settings</h1>

      <div className="help-section">
        <div className="settings-row">
          <span className="settings-label">Dark mode</span>
          <button
            className={`settings-toggle ${darkMode ? 'settings-toggle-on' : ''}`}
            onClick={() => onDarkModeChange(!darkMode)}
          >
            {darkMode ? 'ON' : 'OFF'}
          </button>
        </div>
      </div>

      <button className="help-back-button" onClick={onBack}>
        Back to main
      </button>
    </div>
  );
}
