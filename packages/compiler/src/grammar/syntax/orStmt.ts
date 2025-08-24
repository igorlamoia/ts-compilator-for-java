import { TokenIterator } from "../../token/TokenIterator";
import { andStmt } from "./andStmt";
import { restOrStmt } from "./restOrStmt";
import { Emitter } from "../../ir/emitter";
/**
 * Parses the logical OR statement by calling the `andStmt` function
 * and then the `restOrStmt` function.
 *
 * @derivation `<or> -> <and> <restoOr>`
 */
export function orStmt(iterator: TokenIterator, emitter: Emitter): string {
  const left = andStmt(iterator, emitter);
  return restOrStmt(iterator, emitter, left);
}
