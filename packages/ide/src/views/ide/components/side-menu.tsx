import IconButton from "@/components/buttons/icon-button";
import { TooltipContent } from "@/components/ui/tooltip";
import { FileCode2, GitBranch, Search, Settings } from "lucide-react";

interface SideMenuProps {
  isExplorerOpen: boolean;
  setIsExplorerOpen: (open: boolean) => void;
}

export function SideMenu({ isExplorerOpen, setIsExplorerOpen }: SideMenuProps) {
  return (
    <div className="flex  flex-1 sm:flex-col h-full px-4 py-2 sm:w-12 items-center gap-4 border-b sm:border-r border-black/10 dark:border-white/10 sm:py-4">
      <IconButton
        selected={isExplorerOpen}
        onClick={() => setIsExplorerOpen(!isExplorerOpen)}
      >
        <FileCode2 className="h-4 w-4" />
        <TooltipContent>
          {isExplorerOpen
            ? "Fechar explorador de arquivos"
            : "Abrir explorador de arquivos"}
        </TooltipContent>
      </IconButton>
      <button className="rounded-xl p-2 text-muted-foreground hover:text-foreground">
        <Search className="h-4 w-4" />
      </button>
      <button className="rounded-xl p-2 text-muted-foreground hover:text-foreground">
        <GitBranch className="h-4 w-4" />
      </button>
      <button className="rounded-xl p-2 text-muted-foreground hover:text-foreground">
        <Settings className="h-4 w-4" />
      </button>
    </div>
  );
}
