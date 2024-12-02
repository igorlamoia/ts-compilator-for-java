import { TokenIterator } from "../../token/TokenIterator";
import { TOKENS } from "../../token/constants";
import { andStmt } from "./andStmt";

// <restoOr> -> '||' <and> <restoOr> | & ;
export function restOrStmt(iterator: TokenIterator): void {
  while (iterator.match(TOKENS.LOGICALS.logical_or)) {
    iterator.consume(TOKENS.LOGICALS.logical_or);
    andStmt(iterator);
  }
}
