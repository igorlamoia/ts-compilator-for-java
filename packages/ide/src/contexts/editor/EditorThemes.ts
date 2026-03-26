const JAVA_MM_THEME_RULES_DARK = [
  { token: "keyword.type", foreground: "7dd3fc", fontStyle: "bold" },
  { token: "keyword.conditional", foreground: "fbbf24", fontStyle: "bold" },
  { token: "keyword.loop", foreground: "fb7185", fontStyle: "bold" },
  { token: "keyword.flow", foreground: "c084fc", fontStyle: "bold" },
  { token: "keyword.io", foreground: "34d399", fontStyle: "bold" },
  { token: "entity.name.function", foreground: "34d399", fontStyle: "bold" },
  { token: "operator", foreground: "f59e0b", fontStyle: "bold" },
  { token: "operator.word", foreground: "fcd34d", fontStyle: "bold" },
  { token: "delimiter", foreground: "f87171", fontStyle: "bold" },
];

const JAVA_MM_THEME_RULES_LIGHT = [
  { token: "keyword.type", foreground: "0f766e", fontStyle: "bold" },
  { token: "keyword.conditional", foreground: "b45309", fontStyle: "bold" },
  { token: "keyword.loop", foreground: "be123c", fontStyle: "bold" },
  { token: "keyword.flow", foreground: "7c3aed", fontStyle: "bold" },
  { token: "keyword.io", foreground: "047857", fontStyle: "bold" },
  { token: "entity.name.function", foreground: "00478571", fontStyle: "bold" },
  { token: "operator", foreground: "c2410c", fontStyle: "bold" },
  { token: "operator.word", foreground: "d97706", fontStyle: "bold" },
  { token: "delimiter", foreground: "dc2626", fontStyle: "bold" },
];

export const DarkTheme = {
  base: "vs-dark",
  inherit: true,
  rules: JAVA_MM_THEME_RULES_DARK,
  colors: {
    "editor.background": "#00000000",
    "editorGutter.background": "#00000000",
    "editorLineNumber.foreground": "#a7a7a7aa",
    "editorLineNumber.activeForeground": "#ffffffcc",
    "editorCursor.foreground": "#ffffffd9", // cursor piscando
    "editor.lineHighlightBackground": "#ffffff0f", // linha atual
    "editor.selectionBackground": "#ffffff26", // seleção de texto
    "minimap.background": "#0b0f1499",
    "minimapSlider.background": "#ffffff14",
    "minimapSlider.hoverBackground": "#ffffff26",
    "minimapSlider.activeBackground": "#ffffff3d",
  },
} as const;
export const LightTheme = {
  base: "vs",
  inherit: true,
  rules: JAVA_MM_THEME_RULES_LIGHT,
  colors: {
    "editor.background": "#00000000",
    "editorGutter.background": "#00000000",
    "editorLineNumber.foreground": "#1a1a1a66",
    "editorLineNumber.activeForeground": "#1a1a1acc",
    "editorCursor.foreground": "#1a1a1ad9",
    "editor.lineHighlightBackground": "#0000000a",
    "editor.selectionBackground": "#0000001f",
    "minimap.background": "#e6eef799",
    "minimapSlider.background": "#1a1a1a14",
    "minimapSlider.hoverBackground": "#1a1a1a26",
    "minimapSlider.activeBackground": "#1a1a1a3d",
  },
} as const;
