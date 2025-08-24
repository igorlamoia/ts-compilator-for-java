import { TokenIterator } from "../../token/TokenIterator";
import { TOKENS } from "../../token/constants";
import { stmt } from "./stmt";
import { Emitter } from "../../ir/emitter";

/**
 * Parses a list of statements until it finds a closing brace (`}`).
 *
 * @derivation `<stmtList> -> <stmt> <stmtList> | ε`
 */
export function listStmt(iterator: TokenIterator, emitter: Emitter): void {
  while (iterator.hasNext()) {
    if (iterator.match(TOKENS.SYMBOLS.right_brace)) break;
    stmt(iterator, emitter);
  }
}
