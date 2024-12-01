import { TOKENS } from "../../token/constants";
import { TokenIterator } from "../../token/TokenIterator";
import { notStmt } from "./notStmt";

export function andStmt(iterator: TokenIterator): void {
  notStmt(iterator);
  while (iterator.match(TOKENS.LOGICALS.logical_and)) {
    iterator.next(); // Consume `&&`
    notStmt(iterator);
  }
}
