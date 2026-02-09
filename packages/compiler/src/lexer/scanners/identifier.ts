import { LexerScanner } from "./lexer";
import { isAlphaNumeric } from "../lexer-helpers";
import { TOKENS } from "../../token/constants";

const { LITERALS } = TOKENS;
export default class IdentifierScanner extends LexerScanner {
  public run(): void {
    while (isAlphaNumeric(this.lexer.peek())) this.lexer.peekAndAdvance();
    const ident = this.lexer.source.substring(
      this.lexer.scannerBegin,
      this.lexer.current
    );
    const type = this.lexer.keywordMap[ident] ?? LITERALS.identifier;
    this.lexer.addToken(type, ident);
  }
}
