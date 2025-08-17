import { diffLines, diffWords, Change } from "diff";
import {
  DiffPart,
  DiffLine,
  FileUpload,
  DiffSettings,
  CharacterDiff,
  DiffBlock,
  DiffStats,
} from "../types";

export const calculateDiff = (
  leftText: string,
  rightText: string,
  settings: DiffSettings
): DiffPart[] => {
  const options: any = {};

  if (settings.ignoreWhitespace) {
    options.ignoreWhitespace = true;
  }

  if (settings.ignoreCase) {
    options.ignoreCase = true;
  }

  const differences = diffLines(leftText, rightText, options);
  return differences.map((part: Change) => ({
    value: part.value,
    added: part.added,
    removed: part.removed,
  }));
};

export const calculateCharacterDiff = (
  leftText: string,
  rightText: string,
  settings: DiffSettings
): CharacterDiff[] => {
  const options: any = {};

  if (settings.ignoreCase) {
    options.ignoreCase = true;
  }

  // Use word-level diffing for better granularity
  const differences = diffWords(leftText, rightText, {
    ...options,
    ignoreCase: settings.ignoreCase,
    ignoreWhitespace: settings.ignoreWhitespace,
  });

  return differences.map((part: Change) => ({
    value: part.value,
    added: part.added,
    removed: part.removed,
  }));
};

export const processDiffResult = (
  diffResult: DiffPart[],
  side: "left" | "right",
  selectedLines: Set<number>
): DiffLine[] => {
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
      const isSelected = selectedLines.has(currentLine);

      // Only show relevant lines for each side
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
            isSelected,
            partIndex,
            lineIndex,
          });
          lineCount++;
        }
      }

      // Update line counters
      if (side === "left" && !part.added) {
        originalLineCount++;
      }
      if (side === "right" && !part.removed) {
        modifiedLineCount++;
      }
    });
  });

  return lines;
};

export const createDiffBlocks = (diffResult: DiffPart[]): DiffBlock[] => {
  const blocks: DiffBlock[] = [];
  let originalLineCount = 0;
  let modifiedLineCount = 0;
  let currentBlock: DiffBlock | null = null;

  diffResult.forEach((part) => {
    const lines = part.value
      .split("\n")
      .filter((line) => line !== "" || part.value.endsWith("\n"));

    if (part.added || part.removed) {
      if (!currentBlock) {
        currentBlock = {
          originalStart: originalLineCount + 1,
          originalLines: 0,
          modifiedStart: modifiedLineCount + 1,
          modifiedLines: 0,
          lines: [],
        };
      }

      lines.forEach((line, index) => {
        const diffLine: DiffLine = {
          content: line,
          lineNumber: originalLineCount + modifiedLineCount + index + 1,
          isAdded: !!part.added,
          isRemoved: !!part.removed,
          isSelected: false,
          partIndex: 0,
          lineIndex: index,
        };

        currentBlock!.lines.push(diffLine);

        if (part.removed) {
          currentBlock!.originalLines++;
        }
        if (part.added) {
          currentBlock!.modifiedLines++;
        }
      });
    } else {
      if (currentBlock) {
        blocks.push(currentBlock);
        currentBlock = null;
      }
      originalLineCount += lines.length;
      modifiedLineCount += lines.length;
    }
  });

  if (currentBlock) {
    blocks.push(currentBlock);
  }

  return blocks;
};

export const calculateDiffStats = (
  diffResult: DiffPart[],
  leftText: string,
  rightText: string
): DiffStats => {
  const addedLines = diffResult.filter((part) => part.added).length;
  const removedLines = diffResult.filter((part) => part.removed).length;
  const leftLines = leftText.split("\n").length;
  const rightLines = rightText.split("\n").length;
  const totalLines = Math.max(leftLines, rightLines);
  const changedLines = addedLines + removedLines;

  const similarity =
    totalLines > 0
      ? Math.max(0, ((totalLines - changedLines) / totalLines) * 100)
      : 100;

  return {
    addedLines,
    removedLines,
    changedLines,
    totalLines,
    similarity: Math.round(similarity),
  };
};

export const mergeSelectedLines = (
  diffResult: DiffPart[],
  sourceText: string,
  targetText: string,
  selectedLines: Set<number>,
  direction: "left-to-right" | "right-to-left"
): string => {
  if (selectedLines.size === 0) return targetText;

  const sourceLines = sourceText.split("\n");
  const targetLines = targetText.split("\n");
  let sourceLineCount = 0;
  let targetLineCount = 0;

  diffResult.forEach((part) => {
    const lines = part.value
      .split("\n")
      .filter((line) => line !== "" || part.value.endsWith("\n"));

    if (direction === "left-to-right") {
      if (part.added) {
        targetLineCount += lines.length;
      } else if (part.removed) {
        lines.forEach((_, i) => {
          if (selectedLines.has(sourceLineCount + i)) {
            targetLines.splice(
              targetLineCount,
              0,
              sourceLines[sourceLineCount + i]
            );
          }
        });
        sourceLineCount += lines.length;
      } else {
        sourceLineCount += lines.length;
        targetLineCount += lines.length;
      }
    } else {
      if (part.removed) {
        sourceLineCount += lines.length;
      } else if (part.added) {
        lines.forEach((_, i) => {
          if (selectedLines.has(targetLineCount + i)) {
            sourceLines.splice(
              sourceLineCount,
              0,
              targetLines[targetLineCount + i]
            );
          }
        });
        targetLineCount += lines.length;
      } else {
        sourceLineCount += lines.length;
        targetLineCount += lines.length;
      }
    }
  });

  return direction === "left-to-right"
    ? targetLines.join("\n")
    : sourceLines.join("\n");
};

export const readFileAsText = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result;
      if (typeof result === "string") {
        resolve(result);
      } else {
        reject(new Error("Failed to read file as text"));
      }
    };
    reader.onerror = () => reject(new Error("Failed to read file"));
    reader.readAsText(file);
  });
};

export const processFileUpload = async (file: File): Promise<FileUpload> => {
  const content = await readFileAsText(file);
  return {
    name: file.name,
    content,
    size: file.size,
  };
};

export const copyToClipboard = async (text: string): Promise<void> => {
  try {
    await navigator.clipboard.writeText(text);
  } catch (err) {
    // Fallback for older browsers
    const textArea = document.createElement("textarea");
    textArea.value = text;
    document.body.appendChild(textArea);
    textArea.select();
    document.execCommand("copy");
    document.body.removeChild(textArea);
  }
};

export const downloadText = (content: string, filename: string): void => {
  const blob = new Blob([content], { type: "text/plain" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
};

export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return "0 Bytes";
  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
};
