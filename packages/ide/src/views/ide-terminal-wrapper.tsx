import { IDEView } from "./ide";
import { useIntermediatorCode } from "./ide/useIntermediatorCode";
import { EditorProvider } from "@/contexts/EditorContext";
import { KeywordProvider } from "@/contexts/KeywordContext";
import { RuntimeErrorProvider } from "@/contexts/RuntimeErrorContext";

export interface IDEFunctionProps {
  isOpenKeywordCustomizer: boolean;
  setIsOpenKeywordCustomizer: (value: boolean) => void;
}
import { KeywordCustomizer } from "@/components/keyword-customizer";

export function IDEFunction({
  isOpenKeywordCustomizer,
  setIsOpenKeywordCustomizer,
}: IDEFunctionProps) {
  return (
    <EditorProvider>
      <KeywordProvider>
        <RuntimeErrorProvider>
          <IDETerminal />
        </RuntimeErrorProvider>
        <KeywordCustomizer
          isOpen={isOpenKeywordCustomizer}
          setIsOpen={setIsOpenKeywordCustomizer}
        />
      </KeywordProvider>
    </EditorProvider>
  );
}

function IDETerminal() {
  const { handleIntermediateCodeGeneration, intermediateCode } =
    useIntermediatorCode();

  return (
    <>
      <IDEView
        handleIntermediateCodeGeneration={handleIntermediateCodeGeneration}
        intermediateCode={intermediateCode}
        // setIntermediateCode={setIntermediateCode}
      />
    </>
  );
}
