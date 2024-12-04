import { TokenIterator } from "../../token/TokenIterator";
import { restMultStmt } from "./restMultStmt";
import { unitaryStmt } from "./unitaryStmt";

/**
 * Parses the multiplication statement.
 * and calls the restMultStmt function.
 *
 * @derivation `<multStmt> -> <unitaryStmt> <restMultStmt>`
 */
export function multStmt(iterator: TokenIterator): void {
  unitaryStmt(iterator);
  restMultStmt(iterator);
}
