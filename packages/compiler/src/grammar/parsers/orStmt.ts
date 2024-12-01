import { TOKENS } from "../../token/constants";
import { TokenIterator } from "../../token/TokenIterator";
import { andStmt } from "./andStmt";

export function orStmt(iterator: TokenIterator): void {
  andStmt(iterator);
  while (iterator.match(TOKENS.LOGICALS.logical_or)) {
    iterator.next();
    andStmt(iterator);
  }
}
