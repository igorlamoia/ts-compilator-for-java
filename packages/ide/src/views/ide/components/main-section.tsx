import dynamic from "next/dynamic";
import { OpenFIlesList } from "./open-files-list";
import { Editor } from "@/components/editor";
import { useContext } from "react";
import { EditorContext } from "@/contexts/EditorContext";
import { Instruction } from "@ts-compilator-for-java/compiler/interpreter/constants";

const TerminalView = dynamic(() => import("@/components/terminal"), {
  ssr: false,
});

interface MainSectionProps {
  openTabs: string[];
  activeFile: string;
  setActiveFile: (file: string) => void;
  setOpenTabs: (paths: string[] | ((prev: string[]) => string[])) => void;
  isTerminalOpen: boolean;
  toggleTerminal: () => void;
  intermediateCode?: { instructions: Instruction[] };
}

export function MainSection({
  openTabs,
  activeFile,
  setActiveFile,
  setOpenTabs,
  isTerminalOpen,
  toggleTerminal,
  intermediateCode,
}: MainSectionProps) {
  const editorContext = useContext(EditorContext);

  const closeTab = (path: string) => {
    // Save file before closing
    editorContext.saveCurrentFile(path);

    setOpenTabs((prev) => prev.filter((tab) => tab !== path));
    if (activeFile === path) {
      const fallback = openTabs.find((tab) => tab !== path);
      if (fallback) {
        setActiveFile(fallback);
      } else {
        setActiveFile("src/main.?");
      }
    }
  };
  return (
    <div className="flex flex-col h-full w-full overflow-x-auto">
      <OpenFIlesList
        openTabs={openTabs}
        activeFile={activeFile}
        closeTab={closeTab}
        onActiveFileChange={setActiveFile}
      />
      <div className="relative flex-1 overflow-x-auto">
        <Editor />
        <TerminalView
          intermediateCode={intermediateCode?.instructions || []}
          isTerminalOpen={isTerminalOpen}
          toggleTerminal={toggleTerminal}
        />
      </div>
    </div>
  );
}
