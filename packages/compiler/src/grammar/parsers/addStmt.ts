import { TokenIterator } from "../../token/TokenIterator";
import { multStmt } from "./multStmt";
import { restAddStmt } from "./restAddStmt";

// <add> -> <mult> <restoAdd> ;
export function addStmt(iterator: TokenIterator): void {
  multStmt(iterator);
  restAddStmt(iterator);
}
