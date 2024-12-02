import { TokenIterator } from "../../token/TokenIterator";
import { TOKENS } from "../../token/constants";
import { notStmt } from "./notStmt";

// <restoAnd> -> '&&' <not> <restoAnd> | & ;
export function restAndStmt(iterator: TokenIterator): void {
  const { logical_and } = TOKENS.LOGICALS;
  while (iterator.match(logical_and)) {
    iterator.consume(logical_and);
    notStmt(iterator);
  }
}
