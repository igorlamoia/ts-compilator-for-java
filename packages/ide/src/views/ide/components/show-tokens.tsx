import { MainButton } from "@/components/buttons/main";
import { TokenCard } from "@/components/token-card";
import { TLexerAnalyseData } from "@/pages/api/lexer";
import { Classification } from "@/utils/compiler/classification";
import { classifyTokens } from "@/utils/compiler/editor/tokens";
import { useState } from "react";

interface IShowTokensProps {
  analyseData: TLexerAnalyseData;
}

const TokenClassification = new Classification();

export function ShowTokens({ analyseData }: IShowTokensProps) {
  const { tokens } = analyseData;
  const [hideAllTokens, setHideAllTokens] = useState(false);
  const [orientation, setOrientation] = useState<"verticaly" | "horizontaly">(
    "verticaly"
  );
  if (!tokens?.length) return null;
  const formattedTokens = classifyTokens(tokens, TokenClassification);
  const allFormattedTokens = tokens.map((token) => ({
    token,
    info: TokenClassification.classifyToken(token.type),
  }));

  return (
    <>
      <MainButton
        className="max-w-max"
        onClick={() => setHideAllTokens((old) => !old)}
      >
        Sequence Token
      </MainButton>
      <div className="flex flex-col gap-2">
        {!hideAllTokens && (
          <>
            <h2 className="text-xl font-bold">Sequence Tokens</h2>
            <div className="flex gap-2 flex-wrap w-full items-start">
              {allFormattedTokens.map(({ token, info: { styles } }) => (
                <TokenCard
                  key={token.type + token.column}
                  token={token}
                  styles={styles}
                />
              ))}
            </div>
          </>
        )}
        <div className="flex gap-4">
          <MainButton
            className="flex-1"
            onClick={() => setOrientation("horizontaly")}
          >
            Horizontally
          </MainButton>
          <MainButton
            className="flex-1"
            onClick={() => setOrientation("verticaly")}
          >
            Vertically
          </MainButton>
        </div>
        {orientation === "horizontaly" ? (
          Object.entries(formattedTokens).map(([key, values]) => (
            <>
              <h3 className="text-lg font-bold">{key}</h3>
              <div
                key={key}
                className="flex gap-2 flex-wrap w-full  items-start"
              >
                {values.map(({ token, info: { styles } }) => (
                  <TokenCard
                    key={token.type + token.column + "horizontaly"}
                    token={token}
                    styles={styles}
                  />
                ))}
              </div>
            </>
          ))
        ) : (
          <div className="flex gap-2 flex-wrap w-full items-start">
            {Object.entries(formattedTokens).map(([key, values]) => (
              <div key={key} className="flex flex-col gap-2">
                <h3 className="text-lg font-bold">{key}</h3>
                {values.map(({ token, info: { styles } }) => (
                  <TokenCard
                    key={token.type + token.column + "verticaly"}
                    token={token}
                    styles={styles}
                  />
                ))}
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  );
}
