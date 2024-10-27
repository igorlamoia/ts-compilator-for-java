import { MainButton } from "@/components/buttons/main";
import { Editor } from "@/components/editor";
import { useEditor } from "@/hooks/useEditor";
import { api } from "@/utils/axios";
import { useState } from "react";

type TToken = {
  column: number;
  lexeme: string;
  line: number;
  type: number;
};

export function IDEView() {
  const { showLineAlerts, getEditorCode } = useEditor();
  const [tokens, setTokens] = useState([] as TToken[]);
  const handleRun = async () => {
    const code = getEditorCode();
    const { data } = await api.post("/lexer", { sourceCode: code });
    setTokens(data.tokens);
    console.log(tokens);
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
      {/* <pre>{JSON.stringify(tokens)}</pre> */}
      {tokens.length > 0 && (
        <div className="flex flex-col gap-2">
          <h2 className="text-xl font-bold">Tokens</h2>

          <div className="flex gap-2 flex-wrap w-full p-4">
            {tokens.map((token, index) => (
              <div
                className="w-80 shadow-sm bg-slate-600 rounded-sm p-2"
                key={index}
              >
                <p>
                  <strong> Line:</strong> {token.line}
                </p>
                <p>
                  <strong> Column:</strong> {token.column}
                </p>
                <p>
                  <strong> Lexeme:</strong> {token.lexeme}
                </p>
                <p>
                  <strong> Type:</strong> {token.type}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
