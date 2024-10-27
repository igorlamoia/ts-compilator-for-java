import type { MarkerSeverity } from "monaco-editor";

export type TLineAlert = {
  startLineNumber: number;
  startColumn: number;
  endLineNumber: number;
  endColumn: number;
  message: string;
  severity: MarkerSeverity;
};

// Define types
export type TEditorConfig = {
  theme: string;
  language: string;
};

export type TEditorContextType = {
  sourceCode: string;
  config: TEditorConfig;
  updateSourceCode: (newCode: string) => void;
  setConfig: (newConfig: Partial<TEditorConfig>) => void;
  showLineAlerts: (errors: TLineAlert[]) => void;
  initializeEditor: (container: HTMLDivElement) => void;
  getEditorCode: () => string;
};
