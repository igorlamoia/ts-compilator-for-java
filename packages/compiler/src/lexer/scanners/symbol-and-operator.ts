import { TOKENS_MAP } from "../../token/mappings";
import { TOKENS } from "../../token/constants";
import { LexerScanner } from "./lexer";

export default class SymbolAndOperatorScanner extends LexerScanner {
  run(): void {
    const char = this.lexer.peekPrevious();
    const statementTerminatorLexeme = this.lexer.statementTerminatorLexeme;

    if (
      statementTerminatorLexeme &&
      statementTerminatorLexeme.startsWith(char) &&
      this.lexer.source.startsWith(
        statementTerminatorLexeme.slice(1),
        this.lexer.current,
      )
    ) {
      this.lexer.advance(statementTerminatorLexeme.length - 1);
      this.lexer.addToken(
        TOKENS.SYMBOLS.semicolon,
        statementTerminatorLexeme,
      );
      return;
    }

    const tokenFunction = TOKENS_MAP[char];
    if (tokenFunction) tokenFunction(this.lexer);
  }
}
