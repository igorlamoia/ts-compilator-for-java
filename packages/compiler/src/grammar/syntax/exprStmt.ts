import { TokenIterator } from "../../token/TokenIterator";
import { orStmt } from "./orStmt";

/**
 * Parses an expression (starting from the lowest precedence level: OR).
 * @returns A string with the identifier, literal, or temp holding the result
 *
 * @derivation `<expr> -> <or>`
 */
export function exprStmt(iterator: TokenIterator): string {
  return orStmt(iterator);
}
