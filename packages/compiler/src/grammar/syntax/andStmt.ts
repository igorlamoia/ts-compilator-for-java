import { TokenIterator } from "../../token/TokenIterator";
import { notStmt } from "./notStmt";
import { restAndStmt } from "./restAndStmt";
import { Emitter } from "../../ir/emitter";

/**
 * Processes an and statement by first parsing a not statement
 * and then parsing the rest of the and statement.
 *
 * @derivation `<and> -> <not> <restoAnd>`
 */
export function andStmt(iterator: TokenIterator, emitter: Emitter): string {
  const left = notStmt(iterator, emitter);
  return restAndStmt(iterator, emitter, left);
}
