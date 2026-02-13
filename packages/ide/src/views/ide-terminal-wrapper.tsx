import dynamic from "next/dynamic";
import { IDEView } from "./ide";
import { useIntermediatorCode } from "./ide/useIntermediatorCode";
import { EditorProvider } from "@/contexts/EditorContext";
import { KeywordProvider } from "@/contexts/KeywordContext";

const TerminalView = dynamic(() => import("@/components/terminal"), {
  ssr: false,
});

interface IDETerminalProps {
  setIsTerminalOpen: (value: boolean) => void;
  isTerminalOpen: boolean;
}

export function IDEFunction({
  isTerminalOpen,
  setIsTerminalOpen,
}: IDETerminalProps) {
  return (
    <EditorProvider>
      <KeywordProvider>
        <IDETerminal
          isTerminalOpen={isTerminalOpen}
          setIsTerminalOpen={setIsTerminalOpen}
        />
      </KeywordProvider>
    </EditorProvider>
  );
}

function IDETerminal({ setIsTerminalOpen, isTerminalOpen }: IDETerminalProps) {
  const { handleIntermediateCodeGeneration, intermediateCode } =
    useIntermediatorCode();
  return (
    <>
      <IDEView
        setIsTerminalOpen={setIsTerminalOpen}
        handleIntermediateCodeGeneration={handleIntermediateCodeGeneration}
        intermediateCode={intermediateCode}
        // setIntermediateCode={setIntermediateCode}
      />
      <TerminalView
        intermediateCode={intermediateCode?.instructions || []}
        isTerminalOpen={isTerminalOpen}
        toggleTerminal={() => setIsTerminalOpen(!isTerminalOpen)}
      />
    </>
  );
}
