import { TokenIterator } from "../../token/TokenIterator";
import { TOKENS } from "../../token/constants";
import { attributeStmt } from "./attributeStmt";

/**
 * Parses an optional assignment expression (or nothing).
 *
 * @derivation `<optAtrib> → <atrib> | ε`
 */
export function optAttributeStmt(iterator: TokenIterator): void {
  if (iterator.peek().type !== TOKENS.SYMBOLS.semicolon) {
    attributeStmt(iterator);
  }
}
