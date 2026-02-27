import { SideExplorer } from "./index";
import { SearchView } from "./search-view";

export type SidebarView = "explorer" | "search" | "source-control" | "settings";

interface SidebarPanelProps {
  activeView: SidebarView;
  activeFile: string;
  setActiveFile: (path: string) => void;
  setOpenTabs: (paths: string[] | ((prev: string[]) => string[])) => void;
}

export function SidebarPanel({
  activeView,
  activeFile,
  setActiveFile,
  setOpenTabs,
}: SidebarPanelProps) {
  const handleFileSelect = (filePath: string) => {
    setActiveFile(filePath);
    if (!setOpenTabs) return;

    setOpenTabs((prev) => {
      if (prev.includes(filePath)) return prev;
      return [...prev, filePath];
    });
  };

  switch (activeView) {
    case "explorer":
      return (
        <SideExplorer
          activeFile={activeFile}
          setActiveFile={setActiveFile}
          setOpenTabs={setOpenTabs}
        />
      );
    case "search":
      return <SearchView onFileSelect={handleFileSelect} />;
    case "source-control":
      return (
        <div className="flex h-full items-center justify-center p-4 text-xs text-muted-foreground">
          Controle de fonte em breve...
        </div>
      );
    case "settings":
      return (
        <div className="flex h-full items-center justify-center p-4 text-xs text-muted-foreground">
          Configurações em breve...
        </div>
      );
    default:
      return null;
  }
}
