import React from "react";
import { DiffLine, DiffSettings, DiffSide } from "../types";
import "./DiffPanel.css";

interface DiffPanelProps {
  text: string;
  lines: DiffLine[];
  side: DiffSide;
  settings: DiffSettings;
  onTextChange: (text: string) => void;
  onLineToggle: (lineIndex: number) => void;
}

const DiffPanel: React.FC<DiffPanelProps> = ({
  text,
  lines,
  side,
  settings,
  onTextChange,
  onLineToggle,
}) => {
  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    onTextChange(e.target.value);
  };

  const handleLineClick = (lineIndex: number) => {
    onLineToggle(lineIndex);
  };

  const getLineClassName = (line: DiffLine): string => {
    const classes = ["diff-line"];

    if (line.isAdded) classes.push("added");
    if (line.isRemoved) classes.push("removed");
    if (line.isSelected) classes.push("selected");

    return classes.join(" ");
  };

  return (
    <div className="diff-panel">
      <div className="text-input-container">
        <textarea
          value={text}
          onChange={handleTextChange}
          placeholder={`Enter ${
            side === "left" ? "original" : "modified"
          } text here...`}
          className={`text-area ${settings.wordWrap ? "word-wrap" : ""}`}
          spellCheck={false}
        />
      </div>

      <div className="diff-view-container">
        <div className="diff-view">
          {lines.length > 0 ? (
            lines.map((line, index) => (
              <div
                key={`${side}-${line.partIndex}-${line.lineIndex}`}
                className={getLineClassName(line)}
                onClick={() => handleLineClick(line.lineNumber - 1)}
                title={`Line ${line.lineNumber} - Click to select for merging`}
              >
                {settings.showLineNumbers && (
                  <span className="line-number">{line.lineNumber}</span>
                )}
                <span className="line-content">{line.content || "\u00A0"}</span>
                {line.isSelected && (
                  <span className="selection-indicator">✓</span>
                )}
              </div>
            ))
          ) : (
            <div className="empty-state">
              <p>No differences to display</p>
              <p className="empty-hint">
                Enter text in both panels to see the diff
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DiffPanel;

