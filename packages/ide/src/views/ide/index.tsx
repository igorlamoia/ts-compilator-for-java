import { MainButton } from "@/components/buttons/main";
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
      <MainButton className="ml-auto" onClick={handleRun}>
        Lexical Analysis
      </MainButton>
      <ShowTokens analyseData={analyseData} />
    </div>
  );
}
