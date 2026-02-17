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
import { ORIGINAL_KEYWORDS } from "@/contexts/KeywordContext";

const SOURCE_CODE_STORAGE_KEY = "source-code";

// Create the EditorContext with default values
export const EditorContext = createContext<TEditorContextType>(
  {} as TEditorContextType,
);

export function EditorProvider({ children }: { children: ReactNode }) {
  const [sourceCode, setSourceCode] = useState(() => {
    if (typeof window === "undefined") return INITIAL_CODE;
    return localStorage.getItem(SOURCE_CODE_STORAGE_KEY) || INITIAL_CODE;
  });
  const [config, setConfigState] = useState<TEditorConfig>(new ConfigEntity());
  const [loading, setLoading] = useState(true);

  const monacoRef = useRef<typeof monacoEditor | null>(null);
  const editorInstanceRef =
    useRef<monacoEditor.editor.IStandaloneCodeEditor | null>(null);

  useEffect(() => {
    loader.init().then((monaco) => {
      monacoRef.current = monaco;
      // Registrar a linguagem Java-- com as keywords padrão
      registerJavaMMLanguage(monaco, ORIGINAL_KEYWORDS);
      monaco.editor.defineTheme("editor-glass-dark", {
        base: "vs-dark",
        inherit: true,
        rules: [],
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
        rules: [],
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
        ...config,
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
    localStorage.setItem(SOURCE_CODE_STORAGE_KEY, newCode);
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
    localStorage.setItem(SOURCE_CODE_STORAGE_KEY, code);
    return code;
  };

  return (
    <EditorContext.Provider
      value={{
        sourceCode,
        config,
        updateSourceCode,
        setConfig,
        showLineIssues,
        initializeEditor,
        getEditorCode,
        cleanIssues,
        monacoRef,
        retokenize,
      }}
    >
      {loading ? <div>Loading Editor...</div> : children}
    </EditorContext.Provider>
  );
}
