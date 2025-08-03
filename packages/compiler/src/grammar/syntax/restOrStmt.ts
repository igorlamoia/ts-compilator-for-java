import { TokenIterator } from "../../token/TokenIterator";
import { TOKENS } from "../../token/constants";
import { andStmt } from "./andStmt";

/**
 * Parses the rest of the or statement by calling andStmt
 * or does nothing.
 *
 * @derivation `<restoOr> -> '||' <and> <restoOr> | &`
 */
export function restOrStmt(iterator: TokenIterator): void {
  while (iterator.match(TOKENS.LOGICALS.logical_or)) {
    iterator.consume(TOKENS.LOGICALS.logical_or);
    andStmt(iterator);
  }
}
