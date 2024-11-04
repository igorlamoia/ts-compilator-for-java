import { useEditor } from "@/hooks/useEditor";
import React, { useEffect, useRef } from "react";

export function Editor() {
  const { initializeEditor } = useEditor();
  const editorContainerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (editorContainerRef.current) {
      initializeEditor(editorContainerRef.current); // Initialize editor with the container
    }
  }, [initializeEditor]);

  return (
    <div
      ref={editorContainerRef}
      className="min-h-[40vh] w-full h-full  overflow-hidden rounded-sm border-2 border-cyan-600 dark:border-slate-700
      "
    />
  );
}
