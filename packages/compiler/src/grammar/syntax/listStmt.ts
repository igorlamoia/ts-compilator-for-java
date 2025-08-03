import { TOKENS } from "../../token/constants";
import { TokenIterator } from "../../token/TokenIterator";
import { stmt } from "./stmt";

/**
 * Parses a list of statements by calling the stmt function until the right brace is found
 *
 * @derivation `<stmtList> -> <stmt> <stmtList> | &`
 */
export function listStmt(iterator: TokenIterator): void {
  while (iterator.hasNext()) {
    if (iterator.match(TOKENS.SYMBOLS.right_brace, "}")) break;
    stmt(iterator);
  }
}
