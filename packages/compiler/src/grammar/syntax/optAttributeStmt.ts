import { TokenIterator } from "../../token/TokenIterator";
import { TOKENS } from "../../token/constants";
import { attributeStmt } from "./attributeStmt";

/**
 * Parses an optional assignment expression (or nothing).
 *
 * @derivation `<optAtrib> → <atrib> | ε`
 */
export function optAttributeStmt(iterator: TokenIterator): void {
  const current = iterator.peek().type;
  if (
    current !== TOKENS.SYMBOLS.semicolon &&
    current !== TOKENS.SYMBOLS.right_paren
  ) {
    attributeStmt(iterator);
  }
}
