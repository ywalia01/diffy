export interface DiffPart {
  value: string;
  added?: boolean;
  removed?: boolean;
}

export interface DiffLine {
  content: string;
  lineNumber: number;
  isAdded: boolean;
  isRemoved: boolean;
  isSelected: boolean;
  partIndex: number;
  lineIndex: number;
  originalLineNumber?: number;
  modifiedLineNumber?: number;
}

export interface CharacterDiff {
  value: string;
  added?: boolean;
  removed?: boolean;
}

export interface DiffBlock {
  originalStart: number;
  originalLines: number;
  modifiedStart: number;
  modifiedLines: number;
  lines: DiffLine[];
}

export interface SelectedLines {
  left: Set<number>;
  right: Set<number>;
}

export interface DiffState {
  leftText: string;
  rightText: string;
  diffResult: DiffPart[];
  selectedLines: SelectedLines;
}

export interface FileUpload {
  name: string;
  content: string;
  size: number;
}

export interface DiffSettings {
  ignoreWhitespace: boolean;
  ignoreCase: boolean;
  showLineNumbers: boolean;
  wordWrap: boolean;
  characterLevel: boolean;
  showWhitespace: boolean;
}

export type DiffSide = "left" | "right";

export interface DiffStats {
  addedLines: number;
  removedLines: number;
  changedLines: number;
  totalLines: number;
  similarity: number;
}
