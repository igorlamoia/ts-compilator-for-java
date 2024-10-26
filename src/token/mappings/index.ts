import { Lexer } from "lexer";
import { OPERATORS_TOKENS_MAP } from "./operators-tokens";
import { SYMBOLS_TOKENS_MAP } from "./symbols-tokens";

export type TTokenMap = {
  [key: string]: (lexer: Lexer) => void;
};

export const TOKENS_MAP: TTokenMap = {
  ...SYMBOLS_TOKENS_MAP,
  ...OPERATORS_TOKENS_MAP,
};
