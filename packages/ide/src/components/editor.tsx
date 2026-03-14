import { useTheme } from "@/contexts/ThemeContext";
import { useEditor } from "@/hooks/useEditor";
import { useEffect, useRef } from "react";

export function Editor() {
  const { initializeEditor, setConfig } = useEditor();
  const { darkMode } = useTheme();
  const editorContainerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (editorContainerRef.current) {
      initializeEditor(editorContainerRef.current); // Initialize editor with the container
    }
  }, [initializeEditor]);

  useEffect(() => {
    if (darkMode) return setConfig({ theme: "editor-glass-dark" });
    setConfig({ theme: "editor-glass-light" });
  }, [darkMode, setConfig]);

  return <div ref={editorContainerRef} className="w-full h-full" />;
}
