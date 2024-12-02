import { TokenIterator } from "../../token/TokenIterator";
import { outStmt } from "./outStmt";
import { restOutListStmt } from "./restOutListStmt";

// <outList> -> <out> <restoOutList> ;
export function outListStmt(iterator: TokenIterator): void {
  outStmt(iterator);
  restOutListStmt(iterator);
}
