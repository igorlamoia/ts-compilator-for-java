import { TToken } from "@/@types/token";
import { MainButton } from "@/components/buttons/main";
import { TokenCard } from "@/components/token-card";
import { Classification } from "@/utils/compiler/classification";
import { classifyTokens } from "@/utils/compiler/editor/tokens";
import { useState } from "react";

interface IShowTokensProps {
  tokens: TToken[];
}

const TokenClassification = new Classification();

export function ShowTokens({ tokens }: IShowTokensProps) {
  const [hideAllTokens, setHideAllTokens] = useState(false);
  const [orientation, setOrientation] = useState<"verticaly" | "horizontaly">(
    "verticaly"
  );
  if (!tokens.length) return null;
  const formattedTokens = classifyTokens(tokens, TokenClassification);
  const allFormattedTokens = tokens.map((token) => ({
    token,
    info: TokenClassification.classifyToken(token.type),
  }));

  return (
    <>
      <MainButton onClick={() => setHideAllTokens((old) => !old)}>
        Hide All Tokens
      </MainButton>
      <div className="flex flex-col gap-2">
        {!hideAllTokens && (
          <>
            <h2 className="text-xl font-bold">All Tokens</h2>
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
                    key={token.type + token.column}
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
                    key={token.type + token.column}
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
