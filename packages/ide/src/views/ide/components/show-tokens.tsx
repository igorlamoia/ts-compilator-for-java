import { MainButton } from "@/components/buttons/main";
import { TokenCard } from "@/components/token-card";
import { AnimatedList } from "@/components/ui/animated-list";
import { NumberTicker } from "@/components/ui/number-ticker";
import { TLexerAnalyseData } from "@/pages/api/lexer";
import { Classification } from "@/utils/compiler/classification";
import { classifyTokens } from "@/utils/compiler/editor/tokens";
import { motion } from "motion/react";
import { useState } from "react";
import { CardsPreview } from "./cards-preview";

interface IShowTokensProps {
  analyseData: TLexerAnalyseData;
}

const TokenClassification = new Classification();

export function ShowTokens({ analyseData }: IShowTokensProps) {
  const { tokens } = analyseData;
  const [hideAllTokens, setHideAllTokens] = useState(true);
  const [hideTokensByType, setHideTokensByType] = useState(true);
  const [orientation, setOrientation] = useState<"verticaly" | "horizontaly">(
    "verticaly",
  );
  if (!tokens?.length) return null;
  const formattedTokens = classifyTokens(tokens, TokenClassification);
  const allFormattedTokens = tokens.map((token) => ({
    token,
    info: TokenClassification.classifyToken(token.type),
  }));

  return (
    <>
      <p className="text-xl font-medium whitespace-pre-wrap text-center">
        <NumberTicker value={tokens.length} startValue={0} delay={1} /> Tokens
        Generated
      </p>
      <div className="relative left-1/2 right-1/2 w-screen -ml-[50vw] -mr-[50vw]">
        <CardsPreview allFormattedTokens={allFormattedTokens} />
      </div>

      <MainButton onClick={() => setHideAllTokens((old) => !old)}>
        Show Sequence Tokens
      </MainButton>
      <div className="flex flex-col gap-2">
        {!hideAllTokens && (
          <>
            <h2 className="text-xl font-bold">Sequence Tokens</h2>
            <div className="flex gap-2 flex-wrap w-full">
              {allFormattedTokens.map(({ token, info: { styles } }, index) => (
                <motion.div
                  key={token.line + "c" + token.column + "sequence"}
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.04 }}
                  style={{ flex: "1 1 20%" }}
                >
                  <TokenCard token={token} styles={styles} />
                </motion.div>
              ))}
            </div>
          </>
        )}
        <MainButton onClick={() => setHideTokensByType((old) => !old)}>
          Show Token Types
        </MainButton>
        {!hideTokensByType && (
          <>
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
                <div key={key}>
                  <h3 className="text-lg font-bold">{key}</h3>
                  <div className="flex gap-2 flex-wrap w-full">
                    {values.map(({ token, info: { styles } }, index) => (
                      <motion.div
                        key={token.line + "c" + token.column + "horizontaly"}
                        initial={{ opacity: 0, x: -8 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.3, delay: index * 0.04 }}
                        style={{ flex: "1 1 20%" }}
                      >
                        <TokenCard token={token} styles={styles} />
                      </motion.div>
                    ))}
                  </div>
                </div>
              ))
            ) : (
              <div className="flex-1 md:flex gap-2 flex-wrap w-full md:items-start">
                {Object.entries(formattedTokens).map(([key, values]) => (
                  <div key={key} className="flex flex-col gap-2">
                    <h3 className="text-lg font-bold">{key}</h3>
                    {values.map(({ token, info: { styles } }, index) => (
                      <motion.div
                        key={token.line + "c" + token.column + "verticaly"}
                        initial={{ opacity: 0, x: -8 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.3, delay: index * 0.04 }}
                        style={{ flex: "1 1 20%" }}
                      >
                        <TokenCard
                          key={token.line + "c" + token.column + "verticaly"}
                          token={token}
                          styles={styles}
                        />
                      </motion.div>
                    ))}
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </>
  );
}
