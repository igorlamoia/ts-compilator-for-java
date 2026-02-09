import { createContext, useRef, useState, useEffect, ReactNode } from "react";
import loader from "@monaco-editor/loader";
import type * as monacoEditor from "monaco-editor";
import { INITIAL_CODE } from "@/utils/compiler/editor/initial-code";
import { TEditorConfig, TEditorContextType, TLineAlert } from "@/@types/editor";
import { ConfigEntity } from "@/entities/editor-config";
import {
  registerJavaMMLanguage,
  JAVAMM_LANGUAGE_ID,
} from "@/utils/compiler/editor/java-mm-language";
import { ORIGINAL_KEYWORDS } from "@/contexts/KeywordContext";

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
      // Registrar a linguagem Java-- com as keywords padrão
      registerJavaMMLanguage(monaco, ORIGINAL_KEYWORDS);
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
        }))
      );
      // Center the editor view on the error line
      editorInstanceRef.current.revealLineInCenter(alerts[0].startLineNumber);
      if (!triggerError) return;
      editorInstanceRef.current.trigger(
        "keyboard",
        "editor.action.marker.next",
        {}
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
    if (!editorInstanceRef?.current && monacoRef.current) return;
    const model = editorInstanceRef.current!.getModel();
    if (!model) return;
    monacoRef.current!.editor.setModelMarkers(model, "owner", []);
    // editorInstanceRef.current!.trigger("keyboard", "closeWidget", {});
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
