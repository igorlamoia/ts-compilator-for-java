import { TokenIterator } from "../../token/TokenIterator";
import { orStmt } from "./orStmt";

export function exprStmt(iterator: TokenIterator): void {
  orStmt(iterator);
}
