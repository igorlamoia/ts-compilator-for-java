import { TokenIterator } from "../../token/TokenIterator";
import { addStmt } from "./addStmt";
import { restRelationalStmt } from "./restRelationalStmt";
import { Emitter } from "../../ir/emitter";

/**
 * Parses the relational statement by calling the `addStmt` function
 * and then the `restRelationalStmt` function.
 *
 * @derivation `<rel> -> <add> <restoRel>`
 */
export function relationalStmt(
  iterator: TokenIterator,
  emitter: Emitter
): string {
  const left = addStmt(iterator, emitter);
  return restRelationalStmt(iterator, emitter, left);
}
