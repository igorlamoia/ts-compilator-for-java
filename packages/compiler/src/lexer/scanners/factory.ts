import { Lexer } from "..";
import { LexerScanner } from "./lexer";
import { isDigit, isIdentifierStart } from "../lexer-helpers";
import {
  CommentScanner,
  IdentifierScanner,
  NumberScanner,
  StatementTerminatorScanner,
  StringScanner,
  SymbolAndOperatorScanner,
} from ".";
import { TOKENS_MAP } from "../../token/mappings";

export default class LexerScannerFactory {
  static getInstance(char: string, lexer: Lexer): LexerScanner | null {
    if (char === '"') return new StringScanner(lexer);
    if (isDigit(char) || (char === "." && isDigit(lexer.peek())))
      return new NumberScanner(lexer);
    if (lexer.statementTerminatorLexeme?.startsWith(char))
      return new StatementTerminatorScanner(lexer);
    if (isIdentifierStart(char)) return new IdentifierScanner(lexer);
    if (char === "/" && ["*", "/"].includes(lexer.peek()))
      return new CommentScanner(lexer);
    if (Object.keys(TOKENS_MAP).includes(char))
      return new SymbolAndOperatorScanner(lexer);
    return null;
  }
}
