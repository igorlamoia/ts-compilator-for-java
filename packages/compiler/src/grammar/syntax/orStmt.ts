import { TokenIterator } from "../../token/TokenIterator";
import { andStmt } from "./andStmt";
import { restOrStmt } from "./restOrStmt";
/**
 * Parses the logical OR statement and returns the result of the expression.
 *
 * @derivation `<or> -> <and> <restoOr>`
 * @returns The identifier, literal or temp variable holding the result
 */
export function orStmt(iterator: TokenIterator): string {
  const left = andStmt(iterator);
  return restOrStmt(iterator, left);
}
