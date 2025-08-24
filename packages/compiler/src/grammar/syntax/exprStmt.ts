import { TokenIterator } from "../../token/TokenIterator";
import { orStmt } from "./orStmt";

/**
 * Parses an expression and returns the final result (identifier, literal, temp).
 *
 * @derivation `<expr> -> <or>`
 */
export function exprStmt(iterator: TokenIterator): string {
  return orStmt(iterator);
}
