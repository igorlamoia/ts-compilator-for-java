import { TOKENS } from "../../token/constants";
import { TokenIterator } from "../../token/TokenIterator";
import { outStmt } from "./outStmt";

// <restoOutList> -> ',' <out> <restoOutList> | & ;
export function restOutListStmt(iterator: TokenIterator): void {
  const { SYMBOLS } = TOKENS;

  while (iterator.match(SYMBOLS.comma)) {
    iterator.consume(SYMBOLS.comma);
    outStmt(iterator);
  }
}
