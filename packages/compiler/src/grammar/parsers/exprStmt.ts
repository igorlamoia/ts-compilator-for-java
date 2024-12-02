import { TokenIterator } from "../../token/TokenIterator";
import { orStmt } from "./orStmt";

// <expr> -> <or> ;
export function exprStmt(iterator: TokenIterator): void {
  orStmt(iterator);
}
