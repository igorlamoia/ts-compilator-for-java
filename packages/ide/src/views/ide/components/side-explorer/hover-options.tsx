import { ChevronsDownUp, FilePlus2, FolderPlus } from "lucide-react";
import IconButton from "@/components/buttons/icon-button";

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
    <div className="flex items-center  opacity-0 transition-opacity group-hover:opacity-100">
      <IconButton
        tooltip="Criar arquivo"
        aria-label="Criar arquivo"
        onClick={onCreateFile}
        className="size-6 p-3.5 "
      >
        <FilePlus2 />
      </IconButton>
      <IconButton
        tooltip="Criar pasta"
        aria-label="Criar pasta"
        onClick={onCreateFolder}
        className="size-6 p-3.5 "
      >
        <FolderPlus />
      </IconButton>
      <IconButton
        tooltip="Minimizar"
        aria-label="Minimizar"
        onClick={onCollapseAll}
        className="size-6 p-3.5 "
      >
        <ChevronsDownUp />
      </IconButton>
    </div>
  );
}
