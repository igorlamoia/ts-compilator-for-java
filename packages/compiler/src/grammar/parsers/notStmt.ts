import { TOKENS } from "../../token/constants";
import { TokenIterator } from "../../token/TokenIterator";
import { relationalStmt } from "./relationalStmt";

export function notStmt(iterator: TokenIterator): void {
  if (iterator.match(TOKENS.LOGICALS.logical_not)) {
    iterator.next(); // Consume `!`
    notStmt(iterator); // Parse the nested NOT expression
  } else {
    relationalStmt(iterator); // Delegate to relational expressions
  }
}
