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

export interface IDEFunctionProps extends IDETerminalProps {
  isOpenKeywordCustomizer: boolean;
  setIsOpenKeywordCustomizer: (value: boolean) => void;
}
import { KeywordCustomizer } from "@/components/keyword-customizer";

export function IDEFunction({
  isTerminalOpen,
  setIsTerminalOpen,
  isOpenKeywordCustomizer,
  setIsOpenKeywordCustomizer,
}: IDETerminalProps & IDEFunctionProps) {
  return (
    <EditorProvider>
      <KeywordProvider>
        <IDETerminal
          isTerminalOpen={isTerminalOpen}
          setIsTerminalOpen={setIsTerminalOpen}
        />
        <KeywordCustomizer
          isOpen={isOpenKeywordCustomizer}
          setIsOpen={setIsOpenKeywordCustomizer}
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
