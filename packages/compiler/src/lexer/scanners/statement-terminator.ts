import { TOKENS } from "../../token/constants";
import { isIdentifierPart, isIdentifierStart } from "../lexer-helpers";
import IdentifierScanner from "./identifier";
import { LexerScanner } from "./lexer";
import SymbolAndOperatorScanner from "./symbol-and-operator";

export default class StatementTerminatorScanner extends LexerScanner {
  run(): void {
    const lexeme = this.lexer.statementTerminatorLexeme;
    if (!lexeme) {
      return this.fallback();
    }

    const startChar = this.lexer.peekPrevious();
    if (!lexeme.startsWith(startChar)) {
      return this.fallback();
    }

    const remainingLexeme = lexeme.slice(1);
    if (!this.lexer.source.startsWith(remainingLexeme, this.lexer.current)) {
      return this.fallback();
    }

    if (isIdentifierStart(lexeme[0] ?? "")) {
      const nextChar =
        this.lexer.source[this.lexer.current + remainingLexeme.length] ?? "\0";
      if (isIdentifierPart(nextChar)) {
        return this.fallbackToIdentifier();
      }
    }

    this.lexer.advance(lexeme.length - 1);
    this.lexer.addToken(TOKENS.SYMBOLS.semicolon, lexeme);
  }

  private fallback(): void {
    const lexeme = this.lexer.statementTerminatorLexeme;
    if (lexeme && isIdentifierStart(lexeme[0] ?? "")) {
      return this.fallbackToIdentifier();
    }

    return this.fallbackToSymbol();
  }

  private fallbackToIdentifier(): void {
    new IdentifierScanner(this.lexer).run();
  }

  private fallbackToSymbol(): void {
    new SymbolAndOperatorScanner(this.lexer).run();
  }
}
