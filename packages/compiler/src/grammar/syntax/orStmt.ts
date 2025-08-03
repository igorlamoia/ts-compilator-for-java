import { TokenIterator } from "../../token/TokenIterator";
import { andStmt } from "./andStmt";
import { restOrStmt } from "./restOrStmt";

/**
 * Parses the logical OR statement by calling the `andStmt` function
 * and then the `restOrStmt` function.
 *
 * @derivation `<or> -> <and> <restoOr>`
 */
export function orStmt(iterator: TokenIterator): void {
  andStmt(iterator);
  restOrStmt(iterator);
}
