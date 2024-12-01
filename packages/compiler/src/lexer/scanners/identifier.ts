import { LexerScanner } from "./lexer";
import { isAlphaNumeric } from "../lexer-helpers";
import { TOKENS } from "../../token/constants";

const { LITERALS, RESERVEDS } = TOKENS;
export default class IdentifierScanner extends LexerScanner {
  public run(): void {
    while (isAlphaNumeric(this.lexer.peek())) this.lexer.peekAndAdvance();
    const ident = this.lexer.source.substring(
      this.lexer.scannerBegin,
      this.lexer.current
    ) as keyof typeof RESERVEDS;
    const type = RESERVEDS[ident] ?? LITERALS.identifier;
    this.lexer.addToken(type, ident);
  }
}
