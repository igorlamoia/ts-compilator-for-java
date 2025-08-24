import { TokenIterator } from "../../token/TokenIterator";
import { TOKENS } from "../../token/constants";
import { typeStmt } from "./typeStmt";
import { blockStmt } from "./blockStmt";
import { Emitter } from "../../ir/emitter";

/**
 * Parses a function declaration or call with no parameters.
 * Emits a LABEL for the function body and processes its block.
 *
 * @derivation `<function*> → <type> IDENT '(' ')' <bloco>`
 */
export function functionCall(iterator: TokenIterator, emitter: Emitter): void {
  const { left_paren, right_paren } = TOKENS.SYMBOLS;

  typeStmt(iterator); // Ex: int, float, string (não usado agora)
  const identifier = iterator.consume(TOKENS.LITERALS.identifier); // nome da função

  iterator.consume(left_paren); // (
  iterator.consume(right_paren); // )

  // Gerar um label para o corpo da função
  emitter.emit("LABEL", identifier.lexeme, null, null);

  // Processar o corpo da função
  blockStmt(iterator, emitter);
}
