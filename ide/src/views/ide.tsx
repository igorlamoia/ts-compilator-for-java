import { MainButton } from "@/components/buttons/main";
import { Editor } from "@/components/editor";
import { useEditor } from "@/hooks/useEditor";
import { api } from "@/utils/axios";

export function IDEView() {
  const { showLineAlerts, getEditorCode } = useEditor();
  const handleRun = async () => {
    const code = getEditorCode();
    // const { tokens } = await api.post("/lexer", { sourceCode: code });
    // console.log(tokens);
    // console.table(tokens);
    showLineAlerts([
      {
        startLineNumber: 10,
        startColumn: 1,
        endLineNumber: 11,
        endColumn: 10,
        message: "This is a warning",
        severity: 2,
      },
    ]);
  };
  return (
    <div className="flex flex-col gap-4">
      <Editor />
      <MainButton className="ml-auto" onClick={handleRun}>
        Run
      </MainButton>
    </div>
  );
}
