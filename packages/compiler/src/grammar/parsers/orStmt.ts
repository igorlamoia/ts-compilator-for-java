import { TokenIterator } from "../../token/TokenIterator";
import { andStmt } from "./andStmt";
import { restOrStmt } from "./restOrStmt";

// <or> -> <and> <restoOr> ;
export function orStmt(iterator: TokenIterator): void {
  andStmt(iterator);
  restOrStmt(iterator);
}
