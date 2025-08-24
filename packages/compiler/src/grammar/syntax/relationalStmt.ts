import { TokenIterator } from "../../token/TokenIterator";
import { addStmt } from "./addStmt";
import { restRelationalStmt } from "./restRelationalStmt";

/**
 * Parses the relational statement by calling the `addStmt` function
 * and then the `restRelationalStmt` function.
 *
 * @derivation `<rel> -> <add> <restoRel>`
 */
export function relationalStmt(iterator: TokenIterator): string {
  const left = addStmt(iterator);
  return restRelationalStmt(iterator, left);
}
