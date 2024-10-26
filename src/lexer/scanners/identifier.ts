import { isAlphaNumeric } from "../../lexer/lexer-helpers";
import { LexerScanner } from "./lexer-scanner";
import { LITERALS, RESERVEDS } from "../../token/constants";

export default class IdentifierScanner extends LexerScanner {
  public run(): void {
    while (isAlphaNumeric(this.lexer.peek())) this.lexer.peekAndAdvance();
    const ident = this.lexer.source.substring(
      this.lexer.start,
      this.lexer.current
    ) as keyof typeof RESERVEDS;
    const type = RESERVEDS[ident] ?? LITERALS.identifier;
    this.lexer.addToken(type, ident);
  }
}