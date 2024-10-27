import { TToken } from "@/@types/token";
import { TokenCard } from "@/components/token-card";
import { Classification } from "@/utils/compiler/classification";
import { classifyTokens } from "@/utils/compiler/editor/tokens";

interface IShowTokensProps {
  tokens: TToken[];
}

const TokenClassification = new Classification();

export function ShowTokens({ tokens }: IShowTokensProps) {
  if (!tokens.length) return null;
  const formattedTokens = classifyTokens(tokens, TokenClassification);
  const allFormattedTokens = tokens.map((token) => ({
    token,
    info: TokenClassification.classifyToken(token.type),
  }));

  return (
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
  );
}
