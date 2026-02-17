import dynamic from "next/dynamic";
import { OpenFIlesList } from "./open-files-list";
import { Editor } from "@/components/editor";

const TerminalView = dynamic(() => import("@/components/terminal"), {
  ssr: false,
});

interface MainSectionProps {
  openTabs: string[];
  activeFile: string;
  setActiveFile: (file: string) => void;
  setOpenTabs: (paths: string[] | ((prev: string[]) => string[])) => void;
  isTerminalOpen: boolean;
  setIsTerminalOpen: (isOpen: boolean) => void;
  intermediateCode?: { instructions: any[] };
}

export function MainSection({
  openTabs,
  activeFile,
  setActiveFile,
  setOpenTabs,
  isTerminalOpen,
  setIsTerminalOpen,
  intermediateCode,
}: MainSectionProps) {
  const closeTab = (path: string) => {
    setOpenTabs((prev) => prev.filter((tab) => tab !== path));
    if (activeFile === path) {
      const fallback = openTabs.find((tab) => tab !== path);
      setActiveFile(fallback ?? "src/main.?");
    }
  };
  return (
    <div className="flex flex-col">
      <OpenFIlesList
        openTabs={openTabs}
        activeFile={activeFile}
        closeTab={closeTab}
      />
      <div className="relative flex-1 overflow-hidden">
        <Editor />
        <div className="absolute left-0 bottom-0 w-full">
          <TerminalView
            intermediateCode={intermediateCode?.instructions || []}
            isTerminalOpen={isTerminalOpen}
            toggleTerminal={() => setIsTerminalOpen(!isTerminalOpen)}
          />
        </div>
      </div>
    </div>
  );
}
