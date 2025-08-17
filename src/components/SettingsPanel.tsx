import React, { useState } from "react";
import { DiffSettings } from "../types";
import "./SettingsPanel.css";

interface SettingsPanelProps {
  settings: DiffSettings;
  onSettingsChange: (settings: DiffSettings) => void;
}

const SettingsPanel: React.FC<SettingsPanelProps> = ({
  settings,
  onSettingsChange,
}) => {
  const [isOpen, setIsOpen] = useState(false);

  const handleSettingChange = (key: keyof DiffSettings, value: boolean) => {
    onSettingsChange({
      ...settings,
      [key]: value,
    });
  };

  const togglePanel = () => {
    setIsOpen(!isOpen);
  };

  return (
    <div className="settings-panel">
      <button
        onClick={togglePanel}
        className="settings-toggle"
        title="Diff settings"
      >
        ⚙️ Settings
      </button>

      {isOpen && (
        <div className="settings-dropdown">
          <div className="settings-header">
            <h3>Diff Settings</h3>
            <button
              onClick={togglePanel}
              className="close-button"
              title="Close settings"
            >
              ✕
            </button>
          </div>

          <div className="settings-content">
            <div className="setting-item">
              <label className="setting-label">
                <input
                  type="checkbox"
                  checked={settings.ignoreWhitespace}
                  onChange={(e) =>
                    handleSettingChange("ignoreWhitespace", e.target.checked)
                  }
                />
                <span className="setting-text">Ignore whitespace</span>
              </label>
              <span className="setting-description">
                Ignore differences in spaces, tabs, and line endings
              </span>
            </div>

            <div className="setting-item">
              <label className="setting-label">
                <input
                  type="checkbox"
                  checked={settings.ignoreCase}
                  onChange={(e) =>
                    handleSettingChange("ignoreCase", e.target.checked)
                  }
                />
                <span className="setting-text">Ignore case</span>
              </label>
              <span className="setting-description">
                Ignore differences in letter casing
              </span>
            </div>

            <div className="setting-item">
              <label className="setting-label">
                <input
                  type="checkbox"
                  checked={settings.showLineNumbers}
                  onChange={(e) =>
                    handleSettingChange("showLineNumbers", e.target.checked)
                  }
                />
                <span className="setting-text">Show line numbers</span>
              </label>
              <span className="setting-description">
                Display line numbers in diff view
              </span>
            </div>

            <div className="setting-item">
              <label className="setting-label">
                <input
                  type="checkbox"
                  checked={settings.wordWrap}
                  onChange={(e) =>
                    handleSettingChange("wordWrap", e.target.checked)
                  }
                />
                <span className="setting-text">Word wrap</span>
              </label>
              <span className="setting-description">
                Wrap long lines in text areas
              </span>
            </div>

            <div className="setting-item">
              <label className="setting-label">
                <input
                  type="checkbox"
                  checked={settings.characterLevel}
                  onChange={(e) =>
                    handleSettingChange("characterLevel", e.target.checked)
                  }
                />
                <span className="setting-text">Character-level diff</span>
              </label>
              <span className="setting-description">
                Show character-level differences within lines
              </span>
            </div>

            <div className="setting-item">
              <label className="setting-label">
                <input
                  type="checkbox"
                  checked={settings.showWhitespace}
                  onChange={(e) =>
                    handleSettingChange("showWhitespace", e.target.checked)
                  }
                />
                <span className="setting-text">Show whitespace</span>
              </label>
              <span className="setting-description">
                Highlight whitespace characters in diff view
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SettingsPanel;
