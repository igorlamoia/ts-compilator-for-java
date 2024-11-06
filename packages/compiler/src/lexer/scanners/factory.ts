import { LexerScanner } from "./lexer";
import {
  CommentScanner,
  IdentifierScanner,
  NumberScanner,
  StringScanner,
  SymbolAndOperatorScanner,
} from ".";
import { isDigit, isAlpha } from "../lexer-helpers";
import { Lexer } from "..";
import { TOKENS_MAP } from "../../token/mappings";

export default class LexerScannerFactory {
  static getInstance(char: string, lexer: Lexer): LexerScanner | null {
    if (char === '"') return new StringScanner(lexer);
    if (isDigit(char) || (char === "." && isDigit(lexer.peek())))
      return new NumberScanner(lexer);
    if (isAlpha(char)) return new IdentifierScanner(lexer);
    if (char === "/" && ["*", "/"].includes(lexer.peek()))
      return new CommentScanner(lexer);
    if (Object.keys(TOKENS_MAP).includes(char))
      return new SymbolAndOperatorScanner(lexer);
    return null;
  }
}
