import { TEditorConfig } from "@/@types/editor";

export const EDITOR_THEMES = ["vs", "vs-dark", "hc-black", "hc-light"];

const DEFAULT_EDITOR_OPTIONS: TEditorConfig["editorOptions"] = {
  automaticLayout: true,
  glyphMargin: true,
  fixedOverflowWidgets: true,
  minimap: { enabled: true },
  scrollbar: {
    vertical: "auto",
    horizontal: "auto",
    verticalScrollbarSize: 10,
    horizontalScrollbarSize: 10,
    alwaysConsumeMouseWheel: false,
  },
  scrollBeyondLastLine: false,
  wordBasedSuggestions: "off",
  quickSuggestions: true,
  suggestOnTriggerCharacters: false,
};

const DEFAULT_VALUES = {
  theme: EDITOR_THEMES[1],
  language: "java--",
  editorOptions: DEFAULT_EDITOR_OPTIONS,
};

export class ConfigEntity {
  theme: string;
  language: string;
  editorOptions: TEditorConfig["editorOptions"];

  constructor(props: Partial<TEditorConfig> = {}) {
    // get from local storage
    this.theme = props.theme ?? DEFAULT_VALUES.theme;
    this.language = props.language ?? DEFAULT_VALUES.language;
    this.editorOptions = {
      ...DEFAULT_VALUES.editorOptions,
      ...(props.editorOptions ?? {}),
    };
  }
}
