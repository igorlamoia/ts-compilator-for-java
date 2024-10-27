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
      style={{
        minHeight: "40vh",
        height: "100%",
        width: "100%",
      }}
    />
  );
}
