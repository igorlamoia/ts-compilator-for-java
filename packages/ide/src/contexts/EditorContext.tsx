import { createContext, useRef, useState, useEffect, ReactNode } from "react";
import loader from "@monaco-editor/loader";
import type * as monacoEditor from "monaco-editor";
import { INITIAL_CODE } from "@/utils/compiles/editor/initial-code";
import { TEditorConfig, TEditorContextType, TLineAlert } from "@/@types/editor";
import { ConfigEntity } from "@/entities/editor-config";

// Create the EditorContext with default values
export const EditorContext = createContext<TEditorContextType>(
  {} as TEditorContextType
);

export function EditorProvider({ children }: { children: ReactNode }) {
  const [sourceCode, setSourceCode] = useState(INITIAL_CODE);
  const [config, setConfigState] = useState<TEditorConfig>(new ConfigEntity());
  const [loading, setLoading] = useState(true);

  const monacoRef = useRef<typeof monacoEditor | null>(null);
  const editorInstanceRef =
    useRef<monacoEditor.editor.IStandaloneCodeEditor | null>(null);

  useEffect(() => {
    loader.init().then((monaco) => {
      monacoRef.current = monaco;
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

  const setConfig = (newConfig: Partial<TEditorConfig>) => {
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
  };

  const updateSourceCode = (newCode: string) => {
    setSourceCode(newCode);
    editorInstanceRef.current?.setValue(newCode);
  };

  const showLineAlerts = (alerts: TLineAlert[]) => {
    if (editorInstanceRef.current && monacoRef.current) {
      const model = editorInstanceRef.current.getModel();

      if (model) {
        monacoRef.current.editor.setModelMarkers(
          model,
          "owner",
          alerts.map((alert) => ({
            startLineNumber: alert.startLineNumber,
            startColumn: alert.startColumn,
            endLineNumber: alert.endLineNumber,
            endColumn: alert.endColumn,
            message: alert.message,
            severity: alert.severity,
          }))
        );
      }
    }
  };

  const getEditorCode = () => {
    return editorInstanceRef.current?.getValue() ?? "";
  };

  return (
    <EditorContext.Provider
      value={{
        sourceCode,
        config,
        updateSourceCode,
        setConfig,
        showLineAlerts,
        initializeEditor,
        getEditorCode,
      }}
    >
      {loading ? <div>Loading Editor...</div> : children}
    </EditorContext.Provider>
  );
}
