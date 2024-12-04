import { TokenIterator } from "../../token/TokenIterator";
import { orStmt } from "./orStmt";

/**
 * Processes an expression statement by parsing an or statement.
 *
 * @derivation `<expr> -> <or>`
 */
export function exprStmt(iterator: TokenIterator): void {
  orStmt(iterator);
}
