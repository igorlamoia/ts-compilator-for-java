import { useContext } from "react";
import { EditorContext } from "@/contexts/EditorContext";

export function useEditorWithFileSystem() {
  const context = useContext(EditorContext);

  return {
    ...context,
    switchToFile: (filePath: string, initialCode?: string) => {
      // Save current file before switching
      if (context.sourceCode) {
        const lastActive = sessionStorage.getItem("lastActiveFile");
        if (lastActive && lastActive !== filePath) {
          context.saveCurrentFile(lastActive);
        }
      }

      // Load the new file
      context.loadFileContent(filePath, initialCode);

      // Track the active file
      sessionStorage.setItem("lastActiveFile", filePath);
    },
  };
}
