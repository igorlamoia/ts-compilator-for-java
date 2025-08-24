import { TokenIterator } from "../../token/TokenIterator";
import { TOKENS } from "../../token/constants";
import { attributeStmt } from "./attributeStmt";
import { Emitter } from "../../ir/emitter";

/**
 * Parses an optional assignment expression (or nothing).
 *
 * @derivation `<optAtrib> → <atrib> | ε`
 */
export function optAttributeStmt(
  iterator: TokenIterator,
  emitter: Emitter
): void {
  if (iterator.peek().type !== TOKENS.SYMBOLS.semicolon) {
    attributeStmt(iterator, emitter);
  }
}
