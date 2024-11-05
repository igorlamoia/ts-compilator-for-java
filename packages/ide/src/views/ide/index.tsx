import { HeroButton } from "@/components/buttons/hero";
import { Editor } from "@/components/editor";
import { ShowTokens } from "./components/show-tokens";
import { useLexerAnalyse } from "./useLexerAnalyse";

export function IDEView() {
  const { handleRun, analyseData } = useLexerAnalyse();

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
    </div>
  );
}
