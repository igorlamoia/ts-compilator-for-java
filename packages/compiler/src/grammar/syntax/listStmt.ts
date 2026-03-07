import { TokenIterator } from "../../token/TokenIterator";
import { TOKENS } from "../../token/constants";
import { stmt } from "./stmt";

/**
 * Parses a list of statements until it finds a closing brace (`}`) or DEDENT token.
 *
 * @derivation `<stmtList> -> <stmt> <stmtList> | ε`
 */
export function listStmt(iterator: TokenIterator): void {
  while (iterator.hasNext()) {
    // Stop at closing brace (delimited mode) or DEDENT (indentation mode)
    if (iterator.match(TOKENS.SYMBOLS.right_brace)) break;
    if (iterator.match(TOKENS.SYMBOLS.dedent)) break;

    stmt(iterator);
  }
}
