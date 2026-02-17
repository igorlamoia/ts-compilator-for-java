import { FileCode2, GitBranch, Search, Settings } from "lucide-react";

interface SideMenuProps {
  isExplorerOpen: boolean;
  setIsExplorerOpen: (open: boolean) => void;
}

export function SideMenu({ isExplorerOpen, setIsExplorerOpen }: SideMenuProps) {
  return (
    <div className="flex sm:flex-col px-4 py-2 items-center gap-4 border-r border-white/10 sm:py-4">
      <button
        className="rounded-xl bg-white/10 p-2 text-white"
        onClick={() => setIsExplorerOpen(!isExplorerOpen)}
      >
        <FileCode2 className="h-4 w-4" />
      </button>
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
