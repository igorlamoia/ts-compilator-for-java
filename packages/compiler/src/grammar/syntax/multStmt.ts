import { TokenIterator } from "../../token/TokenIterator";
import { restMultStmt } from "./restMultStmt";
import { unitaryStmt } from "./unitaryStmt";
import { Emitter } from "../../ir/emitter";
/**
 * Parses the multiplication statement.
 * and calls the restMultStmt function.
 *
 * @derivation `<multStmt> -> <unitaryStmt> <restMultStmt>`
 */
export function multStmt(iterator: TokenIterator, emitter: Emitter): string {
  const left = unitaryStmt(iterator, emitter);
  return restMultStmt(iterator, emitter, left);
}
