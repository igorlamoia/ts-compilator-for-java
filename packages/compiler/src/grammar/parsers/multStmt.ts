import { TokenIterator } from "../../token/TokenIterator";
import { restMultStmt } from "./restMultStmt";
import { unitaryStmt } from "./unitaryStmt";

// <mult> -> <uno> <restoMult> ;
export function multStmt(iterator: TokenIterator): void {
  unitaryStmt(iterator);
  restMultStmt(iterator);
}
