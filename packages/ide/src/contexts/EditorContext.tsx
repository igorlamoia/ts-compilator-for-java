import {
  createContext,
  useRef,
  useState,
  useEffect,
  ReactNode,
  useCallback,
} from "react";
import loader from "@monaco-editor/loader";
import type * as monacoEditor from "monaco-editor";
import { INITIAL_CODE } from "@/utils/compiler/editor/initial-code";
import { TEditorConfig, TEditorContextType, TLineAlert } from "@/@types/editor";
import { ConfigEntity } from "@/entities/editor-config";
import {
  registerJavaMMLanguage,
  JAVAMM_LANGUAGE_ID,
} from "@/utils/compiler/editor/editor-language";
import { getDefaultKeywordMappings } from "@/contexts/KeywordContext";
import { useFileSystem } from "@/hooks/useFileSystem";

const getSourceCodeStorageKey = (fileName: string) => `source-code-${fileName}`;
const DEFAULT_FILE_NAME = "main.?";
const JAVA_MM_THEME_RULES_DARK = [
  { token: "keyword.type", foreground: "7dd3fc", fontStyle: "bold" },
  { token: "keyword.conditional", foreground: "fbbf24", fontStyle: "bold" },
  { token: "keyword.loop", foreground: "fb7185", fontStyle: "bold" },
  { token: "keyword.flow", foreground: "c084fc", fontStyle: "bold" },
  { token: "keyword.io", foreground: "34d399", fontStyle: "bold" },
];
const JAVA_MM_THEME_RULES_LIGHT = [
  { token: "keyword.type", foreground: "0f766e", fontStyle: "bold" },
  { token: "keyword.conditional", foreground: "b45309", fontStyle: "bold" },
  { token: "keyword.loop", foreground: "be123c", fontStyle: "bold" },
  { token: "keyword.flow", foreground: "7c3aed", fontStyle: "bold" },
  { token: "keyword.io", foreground: "047857", fontStyle: "bold" },
];

// Create the EditorContext with default values
export const EditorContext = createContext<TEditorContextType>(
  {} as TEditorContextType,
);

export function EditorProvider({ children }: { children: ReactNode }) {
  const [currentFilePath, setCurrentFilePath] = useState(DEFAULT_FILE_NAME);
  const [sourceCode, setSourceCode] = useState(() => {
    if (typeof window === "undefined") return INITIAL_CODE;
    return (
      localStorage.getItem(getSourceCodeStorageKey(DEFAULT_FILE_NAME)) ||
      INITIAL_CODE
    );
  });
  const [config, setConfigState] = useState<TEditorConfig>(new ConfigEntity());
  const [loading, setLoading] = useState(true);

  const monacoRef = useRef<typeof monacoEditor | null>(null);
  const editorInstanceRef =
    useRef<monacoEditor.editor.IStandaloneCodeEditor | null>(null);

  const fileSystem = useFileSystem();

  useEffect(() => {
    loader.init().then((monaco) => {
      monacoRef.current = monaco;
      // Registrar a linguagem Java-- com as keywords padrão
      registerJavaMMLanguage(monaco, getDefaultKeywordMappings());
      monaco.editor.defineTheme("editor-glass-dark", {
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
      });
      monaco.editor.defineTheme("editor-glass-light", {
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
      });
      setLoading(false);
    });
  }, []);

  const initializeEditor = (container: HTMLDivElement) => {
    if (!monacoRef.current || !container) return;

    // Initialize the editor only if it's not already initialized
    if (!editorInstanceRef.current) {
      editorInstanceRef.current = monacoRef.current.editor.create(container, {
        value: sourceCode,
        automaticLayout: true,
        minimap: { enabled: true },
        scrollbar: {
          vertical: "auto",
          horizontal: "auto",
          verticalScrollbarSize: 10,
          horizontalScrollbarSize: 10,
          alwaysConsumeMouseWheel: false,
        },
        scrollBeyondLastLine: false,
        ...config,
        wordBasedSuggestions: "off",
        quickSuggestions: true,
        suggestOnTriggerCharacters: false,
      });
    }
  };

  const setConfig = useCallback((newConfig: Partial<TEditorConfig>) => {
    setConfigState((prevConfig) => {
      const updatedConfig = { ...prevConfig, ...newConfig };

      if (newConfig.theme && monacoRef.current) {
        localStorage.setItem("theme", newConfig.theme);
        monacoRef.current.editor.setTheme(newConfig.theme);
      }

      if (newConfig.language && editorInstanceRef.current) {
        const model = editorInstanceRef.current.getModel();
        if (model)
          monacoRef.current?.editor.setModelLanguage(model, newConfig.language);
        localStorage.setItem("language", newConfig.language);
      }

      return updatedConfig;
    });
  }, []);

  const updateSourceCode = (newCode: string) => {
    setSourceCode(newCode);
    localStorage.setItem(getSourceCodeStorageKey(currentFilePath), newCode);
    editorInstanceRef.current?.setValue(newCode);
  };

  const showLineIssues = (alerts: TLineAlert[], triggerError = false) => {
    if (editorInstanceRef.current && monacoRef.current) {
      const model = editorInstanceRef.current.getModel();
      if (!model) return;
      monacoRef.current.editor.setModelMarkers(
        model,
        "owner",
        alerts.map((alert) => ({
          startLineNumber: alert.startLineNumber,
          startColumn: alert.startColumn - 1,
          endLineNumber: alert.endLineNumber,
          endColumn: alert.endColumn - 1,
          message: alert.message,
          severity: alert.severity,
          // tags: [1,2], // unnecessary and deprecated
        })),
      );
      // Center the editor view on the error line
      editorInstanceRef.current.revealLineInCenter(alerts[0].startLineNumber);
      if (!triggerError) return;
      editorInstanceRef.current.trigger(
        "keyboard",
        "editor.action.marker.next",
        {},
      );
    }
  };

  const retokenize = () => {
    if (editorInstanceRef.current && monacoRef.current) {
      const model = editorInstanceRef.current.getModel();
      if (model) {
        // Re-set the language to force Monaco to re-tokenize with updated keywords
        monacoRef.current.editor.setModelLanguage(model, JAVAMM_LANGUAGE_ID);
      }
    }
  };

  const cleanIssues = () => {
    const editor = editorInstanceRef.current;
    const monaco = monacoRef.current;
    if (!editor || !monaco) return;

    const model = editor.getModel();
    if (!model) return;

    const markers = monaco.editor.getModelMarkers({ resource: model.uri });
    const owners = [
      ...new Set(markers.map((marker) => marker.owner).filter(Boolean)),
    ];

    if (owners.length === 0) {
      monaco.editor.setModelMarkers(model, "owner", []);
    } else {
      owners.forEach((owner) =>
        monaco.editor.setModelMarkers(model, owner, []),
      );
    }

    editor.trigger("keyboard", "closeMarkersNavigation", {});
  };

  const getEditorCode = () => {
    cleanIssues();
    const code = editorInstanceRef.current?.getValue() ?? "";
    localStorage.setItem(getSourceCodeStorageKey(currentFilePath), code);
    return code;
  };

  const loadFileContent = useCallback(
    (filePath: string, initialCode?: string) => {
      const fileData = fileSystem.getFile(filePath);
      const storageKey = getSourceCodeStorageKey(filePath);
      const storedCode = localStorage.getItem(storageKey);
      const content =
        fileData?.content ?? storedCode ?? initialCode ?? INITIAL_CODE;

      setCurrentFilePath(filePath);
      setSourceCode(content);
      editorInstanceRef.current?.setValue(content);

      // Ensure file exists in storage
      if (!fileData) {
        fileSystem.createOrUpdateFile(filePath, content);
      }

      // Update localStorage for this file
      localStorage.setItem(storageKey, content);
    },
    [fileSystem],
  );

  const saveCurrentFile = useCallback(
    (filePath: string) => {
      const code = editorInstanceRef.current?.getValue() ?? sourceCode;
      fileSystem.createOrUpdateFile(filePath, code);
      localStorage.setItem(getSourceCodeStorageKey(filePath), code);
      setCurrentFilePath(filePath);
    },
    [sourceCode, fileSystem],
  );

  return (
    <EditorContext.Provider
      value={{
        sourceCode,
        config,
        currentFilePath,
        fileSystem,
        updateSourceCode,
        setConfig,
        showLineIssues,
        initializeEditor,
        getEditorCode,
        cleanIssues,
        monacoRef,
        retokenize,
        loadFileContent,
        saveCurrentFile,
      }}
    >
      {loading ? <EditorSkeleton /> : children}
    </EditorContext.Provider>
  );
}

function EditorSkeleton() {
  return (
    <div className="relative rounded-2xl animate-pulse">
      <div className="rounded-2xl border border-black/10 dark:border-white/10 bg-gray-100/70 dark:bg-neutral-950/70 shadow-[0_20px_60px_-40px_rgba(0,0,0,0.8)]">
        <div className="h-12 border-b border-black/10 dark:border-white/10 px-4 flex items-center gap-3">
          <div className="h-2.5 w-2.5 rounded-full bg-slate-300/70 dark:bg-slate-700/80" />
          <div className="h-2.5 w-2.5 rounded-full bg-slate-300/70 dark:bg-slate-700/80" />
          <div className="h-2.5 w-2.5 rounded-full bg-slate-300/70 dark:bg-slate-700/80" />
          <div className="ml-3 h-4 w-40 rounded bg-slate-300/70 dark:bg-slate-700/80" />
        </div>

        <div className="flex h-[70vh] overflow-hidden rounded-b-2xl">
          <div className="w-12 border-r border-black/10 dark:border-white/10 p-2 space-y-2">
            <div className="h-7 rounded-md bg-slate-300/70 dark:bg-slate-700/80" />
            <div className="h-7 rounded-md bg-slate-300/60 dark:bg-slate-700/70" />
            <div className="h-7 rounded-md bg-slate-300/60 dark:bg-slate-700/70" />
          </div>

          <div className="hidden sm:block w-70 border-r border-black/10 dark:border-white/10 p-3 space-y-3">
            <div className="h-4 w-28 rounded bg-slate-300/70 dark:bg-slate-700/80" />
            <div className="h-8 rounded-lg bg-slate-300/60 dark:bg-slate-700/70" />
            <div className="h-8 rounded-lg bg-slate-300/60 dark:bg-slate-700/70" />
            <div className="h-8 rounded-lg bg-slate-300/60 dark:bg-slate-700/70" />
            <div className="h-8 rounded-lg bg-slate-300/60 dark:bg-slate-700/70" />
          </div>

          <div className="flex-1 flex flex-col min-w-0">
            <div className="h-9 border-b border-black/10 dark:border-white/10 px-3 flex items-center gap-2">
              <div className="h-6 w-28 rounded-md bg-slate-300/70 dark:bg-slate-700/80" />
              <div className="h-6 w-24 rounded-md bg-slate-300/60 dark:bg-slate-700/70" />
            </div>

            <div className="flex-1 p-4">
              <div className="h-full w-full rounded-xl border border-black/10 dark:border-white/10 bg-black/5 dark:bg-white/3 p-3 space-y-2">
                <div className="h-3 w-2/3 rounded bg-slate-300/70 dark:bg-slate-700/80" />
                <div className="h-3 w-3/5 rounded bg-slate-300/60 dark:bg-slate-700/70" />
                <div className="h-3 w-4/5 rounded bg-slate-300/60 dark:bg-slate-700/70" />
                <div className="h-3 w-1/2 rounded bg-slate-300/60 dark:bg-slate-700/70" />
                <div className="h-3 w-3/4 rounded bg-slate-300/60 dark:bg-slate-700/70" />
              </div>
            </div>

            <div className="h-30 border-t border-black/10 dark:border-white/10 px-3 py-2 space-y-2">
              <div className="h-3 w-24 rounded bg-slate-300/70 dark:bg-slate-700/80" />
              <div className="h-3 w-2/3 rounded bg-slate-300/60 dark:bg-slate-700/70" />
              <div className="h-3 w-1/3 rounded bg-slate-300/60 dark:bg-slate-700/70" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
