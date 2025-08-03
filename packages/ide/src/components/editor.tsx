import { useTheme } from "@/contexts/ThemeContext";
import { useEditor } from "@/hooks/useEditor";
import React, { useEffect, useRef } from "react";

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
    if (darkMode) return setConfig({ theme: "vs-dark" });
    setConfig({ theme: "hc-light" });
  }, [setConfig, darkMode]);

  return (
    <div
      ref={editorContainerRef}
      className="
      w-full h-full  overflow-hidden rounded-sm border-2 border-[var(--primary-opaque)]
      border-opacity-50
      "
    />
  );
}
