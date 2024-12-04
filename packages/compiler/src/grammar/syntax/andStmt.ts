import { TokenIterator } from "../../token/TokenIterator";
import { notStmt } from "./notStmt";
import { restAndStmt } from "./restAndStmt";

/**
 * Processes an and statement by first parsing a not statement
 * and then parsing the rest of the and statement.
 *
 * @derivation `<and> -> <not> <restoAnd>`
 */
export function andStmt(iterator: TokenIterator): void {
  notStmt(iterator);
  restAndStmt(iterator);
}
