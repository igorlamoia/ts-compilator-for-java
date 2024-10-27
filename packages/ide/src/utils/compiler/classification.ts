import {
  TTokenClassification,
  TTokenStyle,
  TTokenStyleKey,
} from "@/@types/token";
import { TOKENS, TOKENS_STYLE } from "./server/token/constants";
import { COLORS } from "./styles";

export class Classification {
  public tokensClassification: TTokenClassification;

  constructor() {
    this.tokensClassification = {
      LITERALS: Object.values(TOKENS.LITERALS),
      ARITHMETICS: Object.values(TOKENS.ARITHMETICS),
      ASSIGNMENTS: Object.values(TOKENS.ASSIGNMENTS),
      LOGICALS: Object.values(TOKENS.LOGICALS),
      RELATIONALS: Object.values(TOKENS.RELATIONALS),
      RESERVEDS: Object.values(TOKENS.RESERVEDS),
      SYMBOLS: Object.values(TOKENS.SYMBOLS),
    };
  }

  classifyToken(tokenType: number): {
    type: string | undefined;
    styles: TTokenStyle;
  } {
    const TYPE = this.findTokenClassification(tokenType);
    return {
      type: TYPE ?? "NOT_FOUND",
      styles: this.findTokenStyle(TYPE),
    };
  }

  findTokenStyle(Classification: string | undefined): TTokenStyle {
    return (
      (TOKENS_STYLE[
        `${Classification}_STYLE` as TTokenStyleKey
      ] as TTokenStyle) ?? COLORS.DEFAULT
    );
  }

  findTokenClassification(tokenType: number) {
    const key = Object.entries(this.tokensClassification).find(([, value]) => {
      return value.includes(tokenType);
    });
    return key && key[0];
  }
}
