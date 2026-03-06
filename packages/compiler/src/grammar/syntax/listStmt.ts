import { TokenIterator } from "../../token/TokenIterator";
import { TOKENS } from "../../token/constants";
import { stmt } from "./stmt";
import { skipNewlines } from "./terminator";

/**
 * Parses a list of statements until it finds a closing brace (`}`).
 *
 * @derivation `<stmtList> -> <stmt> <stmtList> | ε`
 */
export function listStmt(iterator: TokenIterator): void {
  skipNewlines(iterator);

  while (iterator.hasNext()) {
    if (iterator.match(TOKENS.SYMBOLS.right_brace)) break;
    stmt(iterator);
    skipNewlines(iterator);
  }
}
