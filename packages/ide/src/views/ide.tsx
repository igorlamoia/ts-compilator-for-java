import { TFormattedToken, TToken } from "@/@types/token";
import { MainButton } from "@/components/buttons/main";
import { Editor } from "@/components/editor";
import { TokenCard } from "@/components/token-card";
import { useEditor } from "@/hooks/useEditor";
import { api } from "@/utils/axios";
import { Classification } from "@/utils/compiler/classification";
import { classifyTokens } from "@/utils/compiler/editor/tokens";
import { useState } from "react";

const TokenClassification = new Classification();

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

  const formattedTokens = classifyTokens(tokens, TokenClassification);
  const allFormattedTokens = tokens.map((token) => ({
    token,
    info: TokenClassification.classifyToken(token.type),
  }));

  console.log(formattedTokens);

  return (
    <div className="flex flex-col gap-4">
      <Editor />
      <MainButton className="ml-auto" onClick={handleRun}>
        Run
      </MainButton>
      {/* <pre>{JSON.stringify(tokens)}</pre> */}
      {tokens.length > 0 && (
        <div className="flex flex-col gap-2">
          <h2 className="text-xl font-bold">All Tokens</h2>
          <div className="flex gap-2 flex-wrap w-full p-4">
            {allFormattedTokens.map(({ token, info: { styles } }) => (
              <TokenCard
                key={token.type + token.column}
                token={token}
                styles={styles}
              />
            ))}
          </div>
          <div className="flex gap-2 flex-wrap w-full p-4">
            {Object.entries(formattedTokens).map(([key, values]) => (
              <div key={key} className="flex flex-col gap-2">
                <h3 className="text-lg font-bold">{key}</h3>
                {values.map(({ token, info: { styles } }) => (
                  <TokenCard
                    key={token.type + token.column}
                    token={token}
                    styles={styles}
                  />
                ))}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
