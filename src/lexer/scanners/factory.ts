import { Lexer } from "lexer";
import { LexerScanner } from "./lexer";
import { IdentifierScanner, NumberScanner, StringScanner } from "./";
import { isDigit, isAlpha } from "../../lexer/lexer-helpers";

export default class LexerScannerFactory {
  static getInstance(char: string, lexer: Lexer): LexerScanner | null {
    if (char === '"') return new StringScanner(lexer);
    if (isDigit(char)) return new NumberScanner(lexer);
    if (isAlpha(char)) return new IdentifierScanner(lexer);
    return null;
  }
}
