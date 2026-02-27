import { useContext } from "react";
import { EditorContext } from "@/contexts/EditorContext";
import { PerfectScrollbar } from "@/components/ui/perfect-scrollbar";

export function OpenFIlesList({
  openTabs,
  activeFile,
  closeTab,
}: {
  openTabs: string[];
  activeFile: string;
  closeTab: (path: string) => void;
}) {
  const editorContext = useContext(EditorContext);

  const handleTabClick = (tab: string) => {
    if (activeFile !== tab) {
      // Save current file before switching
      editorContext.saveCurrentFile(activeFile);
      // Load the new file - this will update activeFile via parent
      editorContext.loadFileContent(tab);
    }
  };

  return (
    <PerfectScrollbar
      height={4}
      className="flex items-center gap-2 border-b border-black/10 bg-white/5 px-2 py-2 dark:border-white/10"
    >
      {openTabs.map((tab) => (
        <button
          key={tab}
          type="button"
          onClick={() => handleTabClick(tab)}
          className={`flex items-center gap-2 rounded-md px-3 py-1 text-xs transition-colors ${
            activeFile === tab
              ? "bg-white/15 text-foreground"
              : "text-muted-foreground hover:text-foreground hover:bg-white/5"
          }`}
        >
          <span className="truncate">{tab}</span>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              closeTab(tab);
            }}
            className="ml-1 text-muted-foreground hover:text-foreground"
          >
            ×
          </button>
        </button>
      ))}
    </PerfectScrollbar>
  );
}
