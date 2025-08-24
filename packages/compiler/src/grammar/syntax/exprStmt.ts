import { TokenIterator } from "../../token/TokenIterator";
import { orStmt } from "./orStmt";
import { Emitter } from "../../ir/emitter";

/**
 * Parses an expression and returns the final result (identifier, literal, temp).
 *
 * @derivation `<expr> -> <or>`
 */
export function exprStmt(iterator: TokenIterator, emitter: Emitter): string {
  return orStmt(iterator, emitter);
}
