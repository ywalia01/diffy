import React, { useState, useCallback } from "react";
import { Button, ButtonGroup } from "@chakra-ui/react";
import { DiffSettings } from "../types";
import ProfessionalDiffViewer from "./ProfessionalDiffViewer";
import EnhancedFileUpload from "./EnhancedFileUpload";
import SettingsPanel from "./SettingsPanel";
import { copyToClipboard, downloadText } from "../utils/diffUtils";
import "./DiffChecker.css";

const DiffChecker: React.FC = () => {
  const [leftText, setLeftText] = useState<string>("");
  const [rightText, setRightText] = useState<string>("");
  const [leftFilename, setLeftFilename] = useState<string>("");
  const [rightFilename, setRightFilename] = useState<string>("");
  const [inputMode, setInputMode] = useState<"upload" | "text">("text");
  const [settings, setSettings] = useState<DiffSettings>({
    ignoreWhitespace: false,
    ignoreCase: false,
    showLineNumbers: true,
    wordWrap: false,
    characterLevel: false,
    showWhitespace: true,
  });

  const handleTextChange = useCallback(
    (side: "left" | "right", text: string) => {
      if (side === "left") {
        setLeftText(text);
      } else {
        setRightText(text);
      }
    },
    []
  );

  const handleFileUpload = useCallback(
    (side: "left" | "right", content: string, filename: string) => {
      handleTextChange(side, content);
      if (side === "left") {
        setLeftFilename(filename);
      } else {
        setRightFilename(filename);
      }
    },
    [handleTextChange]
  );

  const copyDiffResult = useCallback(async () => {
    const diffText = `Diff Result\n\nOriginal: ${
      leftFilename || "Text 1"
    }\nModified: ${
      rightFilename || "Text 2"
    }\n\n${leftText}\n\n---\n\n${rightText}`;
    await copyToClipboard(diffText);
  }, [leftText, rightText, leftFilename, rightFilename]);

  const downloadDiffResult = useCallback(() => {
    const diffText = `Diff Result\n\nOriginal: ${
      leftFilename || "Text 1"
    }\nModified: ${
      rightFilename || "Text 2"
    }\n\n${leftText}\n\n---\n\n${rightText}`;
    const filename = `diff-${new Date().toISOString().split("T")[0]}.txt`;
    downloadText(diffText, filename);
  }, [leftText, rightText, leftFilename, rightFilename]);

  const clearAll = useCallback(() => {
    setLeftText("");
    setRightText("");
    setLeftFilename("");
    setRightFilename("");
  }, []);

  const swapTexts = useCallback(() => {
    const tempText = leftText;
    const tempFilename = leftFilename;
    setLeftText(rightText);
    setRightText(tempText);
    setLeftFilename(rightFilename);
    setRightFilename(tempFilename);
  }, [leftText, rightText, leftFilename, rightFilename]);

  return (
    <div className="diff-checker">
      {/* Header */}
      <header className="diff-header">
        <div className="header-content">
          <h1 className="app-title">
            <span className="title-icon">🔍</span>
            diffy
          </h1>
          <p className="app-subtitle">Making it rain with code changes</p>
        </div>

        <div className="header-actions">
          <SettingsPanel settings={settings} onSettingsChange={setSettings} />
          <ButtonGroup gap={2} size="sm">
            <Button
              onClick={copyDiffResult}
              title="Copy diff result"
              variant="outline"
              colorScheme="gray"
            >
              📋 Copy
            </Button>
            <Button
              onClick={downloadDiffResult}
              title="Download diff result"
              variant="outline"
              colorScheme="gray"
            >
              💾 Download
            </Button>
            <Button
              onClick={swapTexts}
              title="Swap texts"
              variant="outline"
              colorScheme="gray"
            >
              🔄 Swap
            </Button>
            <Button
              onClick={clearAll}
              title="Clear all text"
              variant="outline"
              colorScheme="red"
            >
              🗑️ Clear
            </Button>
          </ButtonGroup>
        </div>
      </header>

      {/* Input Mode Toggle */}
      <div className="input-mode-toggle">
        <ButtonGroup gap={2} size="sm" attached>
          <Button
            variant={inputMode === "text" ? "solid" : "outline"}
            colorScheme={inputMode === "text" ? "blue" : "gray"}
            onClick={() => setInputMode("text")}
          >
            📝 Text Input
          </Button>
          <Button
            variant={inputMode === "upload" ? "solid" : "outline"}
            colorScheme={inputMode === "upload" ? "blue" : "gray"}
            onClick={() => setInputMode("upload")}
          >
            📁 File Upload
          </Button>
        </ButtonGroup>
      </div>

      {/* Text Input Section */}
      {inputMode === "text" && (
        <div className="text-input-section">
          <div className="text-input-container">
            <div className="text-input-panel">
              <div className="panel-header">
                <h3>Original Text</h3>
                <div className="panel-info">
                  {leftText.split("\n").length} lines
                </div>
              </div>
              <textarea
                value={leftText}
                onChange={(e) => handleTextChange("left", e.target.value)}
                placeholder="Enter or paste your original text here..."
                className="text-input-area"
                spellCheck={false}
              />
            </div>
            <div className="text-input-panel">
              <div className="panel-header">
                <h3>Modified Text</h3>
                <div className="panel-info">
                  {rightText.split("\n").length} lines
                </div>
              </div>
              <textarea
                value={rightText}
                onChange={(e) => handleTextChange("right", e.target.value)}
                placeholder="Enter or paste your modified text here..."
                className="text-input-area"
                spellCheck={false}
              />
            </div>
          </div>
        </div>
      )}

      {/* File Upload Section */}
      {inputMode === "upload" && !leftText && !rightText && (
        <div className="upload-section">
          <div className="upload-container">
            <div className="upload-panel">
              <h3>Upload Original File</h3>
              <EnhancedFileUpload
                onFileUpload={(content, filename) =>
                  handleFileUpload("left", content, filename)
                }
              />
            </div>
            <div className="upload-panel">
              <h3>Upload Modified File</h3>
              <EnhancedFileUpload
                onFileUpload={(content, filename) =>
                  handleFileUpload("right", content, filename)
                }
              />
            </div>
          </div>
        </div>
      )}

      {/* Main Diff Viewer */}
      {(leftText || rightText) && (
        <div className="diff-viewer-container">
          <ProfessionalDiffViewer
            leftText={leftText}
            rightText={rightText}
            settings={settings}
            onTextChange={handleTextChange}
          />
        </div>
      )}

      {/* Footer */}
      <footer className="diff-footer">
        <div className="footer-content">
          <div className="file-info">
            {leftFilename && (
              <div className="file-item">
                <span className="file-label">Original:</span>
                <span className="file-name">{leftFilename}</span>
              </div>
            )}
            {rightFilename && (
              <div className="file-item">
                <span className="file-label">Modified:</span>
                <span className="file-name">{rightFilename}</span>
              </div>
            )}
          </div>
          <div className="footer-actions">
            <button
              onClick={() =>
                window.open(
                  "https://github.com/yourusername/diffdaddy",
                  "_blank"
                )
              }
              className="footer-button"
            >
              ⭐ Star on GitHub
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default DiffChecker;
