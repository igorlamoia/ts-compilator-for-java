import { ChevronsDownUp, FilePlus2, FolderPlus } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

export function HoverOptions({
  onCollapseAll,
  onCreateFile,
  onCreateFolder,
}: {
  onCollapseAll: () => void;
  onCreateFile: () => void;
  onCreateFolder: () => void;
}) {
  return (
    <TooltipProvider>
      <div className="flex items-center gap-1 opacity-0 transition-opacity group-hover:opacity-100">
        <Tooltip>
          <TooltipTrigger asChild>
            <button
              type="button"
              aria-label="Criar arquivo"
              className="rounded p-1 text-muted-foreground transition-colors hover:text-foreground"
              onClick={onCreateFile}
            >
              <FilePlus2 className="h-3.5 w-3.5" />
            </button>
          </TooltipTrigger>
          <TooltipContent>
            <p>Criar arquivo</p>
          </TooltipContent>
        </Tooltip>
        <Tooltip>
          <TooltipTrigger asChild>
            <button
              type="button"
              aria-label="Criar pasta"
              className="rounded p-1 text-muted-foreground transition-colors hover:text-foreground"
              onClick={onCreateFolder}
            >
              <FolderPlus className="h-3.5 w-3.5" />
            </button>
          </TooltipTrigger>
          <TooltipContent>
            <p>Criar pasta</p>
          </TooltipContent>
        </Tooltip>
        <Tooltip>
          <TooltipTrigger asChild>
            <button
              type="button"
              aria-label="Minimizar"
              className="rounded p-1 text-muted-foreground transition-colors hover:text-foreground"
              onClick={onCollapseAll}
            >
              <ChevronsDownUp className="h-3.5 w-3.5" />
            </button>
          </TooltipTrigger>
          <TooltipContent>
            <p>Minimizar</p>
          </TooltipContent>
        </Tooltip>
      </div>
    </TooltipProvider>
  );
}
