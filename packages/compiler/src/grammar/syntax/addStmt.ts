import { TokenIterator } from "../../token/TokenIterator";
import { multStmt } from "./multStmt";
import { restAddStmt } from "./restAddStmt";

/**
 * Processes an addition statement by first parsing a multiplication statement
 * and then parsing the rest of the addition statement.
 *
 * @derivation `<add> -> <mult> <restoAdd>`
 */
export function addStmt(iterator: TokenIterator): void {
  multStmt(iterator);
  restAddStmt(iterator);
}
