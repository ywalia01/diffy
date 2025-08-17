import React, { useState, useEffect, useRef, useCallback } from "react";
import {
  Button,
  ButtonGroup,
} from "@chakra-ui/react";
import {
  DiffPart,
  DiffLine,
  DiffSettings,
  DiffStats,
} from "../types";
import {
  calculateDiff,
  calculateDiffStats,
} from "../utils/diffUtils";
import "./ProfessionalDiffViewer.css";

interface ProfessionalDiffViewerProps {
  leftText: string;
  rightText: string;
  settings: DiffSettings;
  onTextChange: (side: "left" | "right", text: string) => void;
}

const ProfessionalDiffViewer: React.FC<ProfessionalDiffViewerProps> = ({
  leftText,
  rightText,
  settings,
  onTextChange,
}) => {
  const [diffResult, setDiffResult] = useState<DiffPart[]>([]);
  // Removed characterDiff state
  const [stats, setStats] = useState<DiffStats>({
    addedLines: 0,
    removedLines: 0,
    changedLines: 0,
    totalLines: 0,
    similarity: 100,
  });
  const [selectedLines] = useState<Set<number>>(new Set());
  const [scrollSync, setScrollSync] = useState(true);
  const [mergePopup, setMergePopup] = useState<{
    lineIndex: number;
    side: "left" | "right";
  } | null>(null);

  const leftScrollRef = useRef<HTMLDivElement>(null);
  const rightScrollRef = useRef<HTMLDivElement>(null);

  // Process diff lines function - moved before handleMerge
  const processDiffLines = useCallback(
    (diffResult: DiffPart[], side: "left" | "right"): DiffLine[] => {
      const lines: DiffLine[] = [];
      let lineCount = 0;
      let originalLineCount = 0;
      let modifiedLineCount = 0;

      diffResult.forEach((part, partIndex) => {
        const partLines = part.value
          .split("\n")
          .filter(
            (line, i, arr) =>
              line !== "" || i < arr.length - 1 || part.value.endsWith("\n")
          );

        partLines.forEach((line, lineIndex) => {
          const currentLine = lineCount;

          if (
            (side === "left" && !part.added) ||
            (side === "right" && !part.removed)
          ) {
            const isAdded = !!part.added;
            const isRemoved = !!part.removed;
            const shouldDisplay =
              (side === "left" && !isAdded) || (side === "right" && !isRemoved);

            if (shouldDisplay) {
              lines.push({
                content: line,
                lineNumber: currentLine + 1,
                originalLineNumber:
                  side === "left" ? originalLineCount + 1 : undefined,
                modifiedLineNumber:
                  side === "right" ? modifiedLineCount + 1 : undefined,
                isAdded,
                isRemoved,
                isSelected: selectedLines.has(currentLine),
                partIndex,
                lineIndex,
              });
              lineCount++;
            }
          }

          if (side === "left" && !part.added) {
            originalLineCount++;
          }
          if (side === "right" && !part.removed) {
            modifiedLineCount++;
          }
        });
      });

      return lines;
    },
    [selectedLines]
  );

  // Calculate diff whenever inputs or settings change
  useEffect(() => {
    if (leftText || rightText) {
      const differences = calculateDiff(leftText, rightText, settings);
      setDiffResult(differences);

      const diffStats = calculateDiffStats(differences, leftText, rightText);
      setStats(diffStats);
    } else {
      setDiffResult([]);
      setStats({
        addedLines: 0,
        removedLines: 0,
        changedLines: 0,
        totalLines: 0,
        similarity: 100,
      });
    }
  }, [leftText, rightText, settings]);

  // Synchronized scrolling
  const handleScroll = useCallback(
    (side: "left" | "right") => {
      if (!scrollSync) return;

      const sourceRef = side === "left" ? leftScrollRef : rightScrollRef;
      const targetRef = side === "left" ? rightScrollRef : leftScrollRef;

      if (sourceRef.current && targetRef.current) {
        const { scrollTop, scrollHeight, clientHeight } = sourceRef.current;
        const scrollPercentage = scrollTop / (scrollHeight - clientHeight);

        const targetScrollHeight = targetRef.current.scrollHeight;
        const targetClientHeight = targetRef.current.clientHeight;
        const targetScrollTop =
          scrollPercentage * (targetScrollHeight - targetClientHeight);

        targetRef.current.scrollTop = targetScrollTop;
      }
    },
    [scrollSync]
  );

  // Removed unused toggleLineSelection function

  const handleLineClick = useCallback(
    (lineIndex: number, side: "left" | "right", event: React.MouseEvent) => {
      setMergePopup({
        lineIndex,
        side,
      });
    },
    []
  );

  const handleMerge = useCallback(
    (direction: "left-to-right" | "right-to-left") => {
      if (!mergePopup) return;

      const { lineIndex, side } = mergePopup;
      console.log("Merge triggered:", { lineIndex, side, direction });

      // Get the actual line content from the diff view
      const diffLines = processDiffLines(diffResult, side);
      const clickedLine = diffLines[lineIndex];

      if (!clickedLine) {
        console.error("No line found at index:", lineIndex);
        setMergePopup(null);
        return;
      }

      console.log("Clicked line:", clickedLine);

      // INTELLIGENT MERGE - like diffchecker.com
      if (direction === "left-to-right") {
        // Merge from left to right
        if (clickedLine.isRemoved) {
          // This is a removed line - we want to restore it to the right
          const targetLines = rightText.split("\n");

          // Find where this line was removed from in the right panel
          const rightLines = processDiffLines(diffResult, "right");
          const correspondingRightLine = rightLines.find(
            (r) => r.originalLineNumber === clickedLine.originalLineNumber
          );

          if (
            correspondingRightLine &&
            correspondingRightLine.modifiedLineNumber
          ) {
            // Replace the corresponding line in the right panel
            const targetIndex = correspondingRightLine.modifiedLineNumber - 1;
            if (targetIndex >= 0 && targetIndex < targetLines.length) {
              targetLines[targetIndex] = clickedLine.content;
              onTextChange("right", targetLines.join("\n"));
            }
          } else {
            // Insert at the original position
            const insertPosition = clickedLine.originalLineNumber
              ? Math.max(0, clickedLine.originalLineNumber - 1)
              : targetLines.length;
            targetLines.splice(insertPosition, 0, clickedLine.content);
            onTextChange("right", targetLines.join("\n"));
          }
        } else if (clickedLine.isAdded) {
          // This is an added line - remove it from the right
          const targetLines = rightText.split("\n");
          const removePosition = clickedLine.modifiedLineNumber
            ? Math.max(0, clickedLine.modifiedLineNumber - 1)
            : targetLines.length - 1;
          if (removePosition >= 0 && removePosition < targetLines.length) {
            targetLines.splice(removePosition, 1);
            onTextChange("right", targetLines.join("\n"));
          }
        }
      } else {
        // Merge from right to left
        if (clickedLine.isAdded) {
          // This is an added line - we want to add it to the left
          const targetLines = leftText.split("\n");

          // Find where this line should be added in the left panel
          const leftLines = processDiffLines(diffResult, "left");
          const correspondingLeftLine = leftLines.find(
            (l) => l.modifiedLineNumber === clickedLine.modifiedLineNumber
          );

          if (
            correspondingLeftLine &&
            correspondingLeftLine.originalLineNumber
          ) {
            // Replace the corresponding line in the left panel
            const targetIndex = correspondingLeftLine.originalLineNumber - 1;
            if (targetIndex >= 0 && targetIndex < targetLines.length) {
              targetLines[targetIndex] = clickedLine.content;
              onTextChange("left", targetLines.join("\n"));
            }
          } else {
            // Insert at the modified position
            const insertPosition = clickedLine.modifiedLineNumber
              ? Math.max(0, clickedLine.modifiedLineNumber - 1)
              : targetLines.length;
            targetLines.splice(insertPosition, 0, clickedLine.content);
            onTextChange("left", targetLines.join("\n"));
          }
        } else if (clickedLine.isRemoved) {
          // This is a removed line - remove it from the left
          const targetLines = leftText.split("\n");
          const removePosition = clickedLine.originalLineNumber
            ? Math.max(0, clickedLine.originalLineNumber - 1)
            : targetLines.length - 1;
          if (removePosition >= 0 && removePosition < targetLines.length) {
            targetLines.splice(removePosition, 1);
            onTextChange("left", targetLines.join("\n"));
          }
        }
      }

      setMergePopup(null);
    },
    [mergePopup, leftText, rightText, onTextChange, diffResult, processDiffLines]
  );

  // Removed unused mergeLineChanges function

  const closeMergePopup = useCallback(() => {
    setMergePopup(null);
  }, []);

  const renderLine = (
    line: DiffLine,
    side: "left" | "right",
    lineIndex: number
  ) => {
    const isSelected = selectedLines.has(line.lineNumber - 1);

    return (
      <div
        key={`${side}-${line.lineNumber}`}
        className={`diff-line ${line.isAdded ? "added" : ""} ${
          line.isRemoved ? "removed" : ""
        } ${isSelected ? "selected" : ""}`}
        onClick={(e) => handleLineClick(lineIndex, side, e)}
        title="Click to merge this line"
      >
        <div className="line-number">
          {side === "left" ? line.originalLineNumber : line.modifiedLineNumber}
        </div>
        <div className="line-content">
          <span className="line-text">{line.content || "\u00A0"}</span>
        </div>
        {/* Removed selection indicator */}
      </div>
    );
  };

  const renderDiffContent = (side: "left" | "right") => {
    if (!diffResult.length) {
      return (
        <div className="empty-state">
          <div className="empty-icon">📝</div>
          <p>No differences to display</p>
          <p className="empty-hint">
            Enter text in both panels to see the diff
          </p>
        </div>
      );
    }

    const lines = processDiffLines(diffResult, side);

    return (
      <div className="diff-content">
        {lines.map((line, index) => renderLine(line, side, index))}
      </div>
    );
  };

  // processDiffLines function moved above and wrapped in useCallback

  return (
    <div className="professional-diff-viewer">
      {/* Header with stats */}
      <div className="diff-header">
        <div className="diff-stats">
          <div className="stat-item">
            <span className="stat-label">Added</span>
            <span className="stat-value added">{stats.addedLines}</span>
          </div>
          <div className="stat-item">
            <span className="stat-label">Removed</span>
            <span className="stat-value removed">{stats.removedLines}</span>
          </div>
          <div className="stat-item">
            <span className="stat-label">Changed</span>
            <span className="stat-value changed">{stats.changedLines}</span>
          </div>
          <div className="stat-item">
            <span className="stat-label">Similarity</span>
            <span className="stat-value similarity">{stats.similarity}%</span>
          </div>
        </div>
        <div className="diff-controls">
          <label className="sync-toggle">
            <input
              type="checkbox"
              checked={scrollSync}
              onChange={(e) => setScrollSync(e.target.checked)}
            />
            <span>Sync Scroll</span>
          </label>
        </div>
      </div>

      {/* Main diff view */}
      <div className="diff-container">
        {/* Left panel */}
        <div className="diff-panel left-panel">
          <div className="panel-header">
            <h3>Original</h3>
            <div className="panel-info">
              {leftText.split("\n").length} lines
            </div>
          </div>
          <div className="text-input">
            <textarea
              value={leftText}
              onChange={(e) => onTextChange("left", e.target.value)}
              placeholder="Enter original text here..."
              className="text-area"
              spellCheck={false}
            />
          </div>
          <div
            className="diff-view"
            ref={leftScrollRef}
            onScroll={() => handleScroll("left")}
          >
            {renderDiffContent("left")}
          </div>
        </div>

        {/* Right panel */}
        <div className="diff-panel right-panel">
          <div className="panel-header">
            <h3>Modified</h3>
            <div className="panel-info">
              {rightText.split("\n").length} lines
            </div>
          </div>
          <div className="text-input">
            <textarea
              value={rightText}
              onChange={(e) => onTextChange("right", e.target.value)}
              placeholder="Enter modified text here..."
              className="text-area"
              spellCheck={false}
            />
          </div>
          <div
            className="diff-view"
            ref={rightScrollRef}
            onScroll={() => handleScroll("right")}
          >
            {renderDiffContent("right")}
          </div>
        </div>
      </div>

      {/* Merge Popup */}
      {mergePopup && (
        <div className="merge-popup-overlay" onClick={closeMergePopup}>
          <div
            className="merge-popup"
            style={{
              left: "50%",
              top: "50%",
              transform: "translate(-50%, -50%)",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="merge-popup-header">
              <span>
                {(() => {
                  const diffLines = processDiffLines(
                    diffResult,
                    mergePopup.side
                  );
                  const clickedLine = diffLines[mergePopup.lineIndex];
                  if (clickedLine) {
                    if (clickedLine.isAdded) {
                      return `Add Line ${mergePopup.lineIndex + 1}`;
                    } else if (clickedLine.isRemoved) {
                      return `Restore Line ${mergePopup.lineIndex + 1}`;
                    } else {
                      return `Copy Line ${mergePopup.lineIndex + 1}`;
                    }
                  }
                  return `Merge Line ${mergePopup.lineIndex + 1}`;
                })()}
              </span>
              <button className="close-popup" onClick={closeMergePopup}>
                ×
              </button>
            </div>
            <div className="merge-popup-content">
              <div className="merge-preview">
                <span className="preview-label">Content:</span>
                <span className="preview-text">
                  {(() => {
                    const diffLines = processDiffLines(
                      diffResult,
                      mergePopup.side
                    );
                    const clickedLine = diffLines[mergePopup.lineIndex];
                    return clickedLine ? clickedLine.content : "";
                  })()}
                </span>
              </div>
              <ButtonGroup gap={2} size="sm">
                <Button
                  variant="outline"
                  colorScheme="blue"
                  onClick={() => {
                    console.log("Button clicked: Merge to Right");
                    handleMerge("left-to-right");
                  }}
                >
                  → Merge to Right
                </Button>
                <Button
                  variant="outline"
                  colorScheme="green"
                  onClick={() => {
                    console.log("Button clicked: Merge to Left");
                    handleMerge("right-to-left");
                  }}
                >
                  Merge to Left ←
                </Button>
              </ButtonGroup>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Removed CharacterDiffContent component

export default ProfessionalDiffViewer;
