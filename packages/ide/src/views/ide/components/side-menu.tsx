import IconButton from "@/components/buttons/icon-button";
import { TooltipContent } from "@/components/ui/tooltip";
import { FileCode2, GitBranch, Search, Settings } from "lucide-react";
import type { SidebarView } from "./side-explorer/sidebar-panel";

interface SideMenuProps {
  isSidebarOpen: boolean;
  setIsSidebarOpen: (open: boolean) => void;
  activeView: SidebarView;
  setActiveView: (view: SidebarView) => void;
}

export function SideMenu({
  isSidebarOpen,
  setIsSidebarOpen,
  activeView,
  setActiveView,
}: SideMenuProps) {
  const handleViewClick = (view: SidebarView) => {
    if (activeView === view && isSidebarOpen) {
      setIsSidebarOpen(false);
    } else {
      setActiveView(view);
      setIsSidebarOpen(true);
    }
  };

  return (
    <div className="flex  flex-1 sm:flex-col h-full px-4 py-2 sm:w-12 items-center gap-4 border-b sm:border-r border-black/10 dark:border-white/10 sm:py-4">
      <IconButton
        selected={isSidebarOpen && activeView === "explorer"}
        onClick={() => handleViewClick("explorer")}
      >
        <FileCode2 className="h-4 w-4" />
        <TooltipContent>Explorador de arquivos</TooltipContent>
      </IconButton>
      <IconButton
        selected={isSidebarOpen && activeView === "search"}
        onClick={() => handleViewClick("search")}
      >
        <Search className="h-4 w-4" />
        <TooltipContent>Buscar</TooltipContent>
      </IconButton>
      <IconButton
        selected={isSidebarOpen && activeView === "source-control"}
        onClick={() => handleViewClick("source-control")}
      >
        <GitBranch className="h-4 w-4" />
        <TooltipContent>Controle de fonte</TooltipContent>
      </IconButton>
      <IconButton
        selected={isSidebarOpen && activeView === "settings"}
        onClick={() => handleViewClick("settings")}
      >
        <Settings className="h-4 w-4" />
        <TooltipContent>Configurações</TooltipContent>
      </IconButton>
    </div>
  );
}
