import { HeroButton } from "@/components/buttons/hero";
import { Editor } from "@/components/editor";
import { ShowTokens } from "./components/show-tokens";
import { useLexerAnalyse } from "./useLexerAnalyse";
import { useIntermediatorCode } from "./useIntermediatorCode";
import { ListIntermediateCode } from "./components/list-intermediate-code";
import { Instruction } from "@ts-compilator-for-java/compiler/interpreter/constants";

export function IDEView({
  setIntermediateCode,
}: {
  setIntermediateCode: (instructions: Instruction[]) => void;
}) {
  const { handleRun, analyseData } = useLexerAnalyse();
  const { handleIntermediateCodeGeneration, intermediateCode } =
    useIntermediatorCode();

  return (
    <div className="flex flex-col gap-4">
      <div className=" h-[65vh]">
        <Editor />
      </div>
      <HeroButton
        start="Lexical Analysis"
        end="Run"
        className="ml-auto"
        onClick={handleRun}
      />
      <ShowTokens analyseData={analyseData} />
      <div>
        <HeroButton
          start="Intermediate Code"
          end="Run"
          className="ml-auto"
          onClick={() => handleIntermediateCodeGeneration(analyseData.tokens)}
        />
        <ListIntermediateCode instructions={intermediateCode.instructions} />
        <div className="mt-3"></div>
        <HeroButton
          start="Execute"
          end="Run"
          className="ml-auto"
          onClick={() => setIntermediateCode(intermediateCode.instructions)}
        />
        {/* <pre className="bg-gray-100 p-4 rounded-md">
          {JSON.stringify(intermediateCode.instructions, null, 2)}
        </pre> */}
      </div>
    </div>
  );
}
