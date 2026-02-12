import dynamic from "next/dynamic";
import { IDEView } from "./ide";
import { useIntermediatorCode } from "./ide/useIntermediatorCode";

const TerminalView = dynamic(() => import("@/components/terminal"), {
  ssr: false,
});

interface IDETerminalProps {
  setIsTerminalOpen: (value: boolean) => void;
  isTerminalOpen: boolean;
}

export function IDETerminal({
  setIsTerminalOpen,
  isTerminalOpen,
}: IDETerminalProps) {
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
