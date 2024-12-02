import { TokenIterator } from "../../token/TokenIterator";
import { notStmt } from "./notStmt";
import { restAndStmt } from "./restAndStmt";

// <and> -> <not> <restoAnd> ;
export function andStmt(iterator: TokenIterator): void {
  notStmt(iterator);
  restAndStmt(iterator);
}
