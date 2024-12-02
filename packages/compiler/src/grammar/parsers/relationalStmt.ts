import { TokenIterator } from "../../token/TokenIterator";
import { addStmt } from "./addStmt";
import { restRelationalStmt } from "./restRelationalStmt";

// <rel> -> <add> <restoRel> ;
export function relationalStmt(iterator: TokenIterator): void {
  addStmt(iterator);
  restRelationalStmt(iterator);
}
