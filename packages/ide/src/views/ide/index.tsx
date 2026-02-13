import { HeroButton } from "@/components/buttons/hero";
import { Editor } from "@/components/editor";
import { ShowTokens } from "./components/show-tokens";
import { useLexerAnalyse } from "./useLexerAnalyse";
import { ListIntermediateCode } from "./components/list-intermediate-code";
import { Instruction } from "@ts-compilator-for-java/compiler/interpreter/constants";
import { TToken } from "@/@types/token";

export function IDEView({
  handleIntermediateCodeGeneration,
  intermediateCode,
  setIsTerminalOpen,
}: {
  handleIntermediateCodeGeneration: (tokens: TToken[]) => Promise<void>;
  intermediateCode: { instructions: Instruction[] };
  setIsTerminalOpen: (isOpen: boolean) => void;
}) {
  const { handleRun, analyseData } = useLexerAnalyse();

  const runAll = async () => {
    const tokens = await handleRun();
    if (tokens) await handleIntermediateCodeGeneration(tokens);
    setTimeout(() => {
      setIsTerminalOpen(true);
    }, 0);
  };

  return (
    <div className="flex flex-col gap-4">
      <div className=" h-[65vh]">
        <Editor />
      </div>
      <div className="flex justify-between items-center w-full">
        <HeroButton start="Lexical Analysis" end="Run" onClick={handleRun} />
        <HeroButton start="Execute All" end="Run" onClick={runAll} />
      </div>

      <ShowTokens analyseData={analyseData} />
      <div className="flex flex-col gap-2">
        <ListIntermediateCode instructions={intermediateCode.instructions} />
      </div>
    </div>
  );
}
