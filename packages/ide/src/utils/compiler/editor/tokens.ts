import { TFormattedToken, TToken } from "@/@types/token";
import { Classification } from "../classification";

export const classifyTokens = (
  tokens: TToken[],
  TokenClassification: Classification
) => {
  return tokens.reduce((acc, token) => {
    // const type = token.type;
    // if (!acc[type]) acc[type] = [] as TFormattedToken[];
    // acc[type].push({
    //   token,
    //   info: TokenClassification.classifyToken(type) ?? {},
    // });
    const { type = "NOT_FOUND", styles } =
      TokenClassification.classifyToken(token.type) ?? {};
    if (!acc[type]) acc[type] = [] as TFormattedToken[];
    acc[type].push({
      token,
      info: { styles, type },
    });
    return acc;
  }, {} as Record<string, TFormattedToken[]>);
};
