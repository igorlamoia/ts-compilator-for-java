import { TokenIterator } from "../../token/TokenIterator";
import { outStmt } from "./outStmt";
import { restOutListStmt } from "./restOutListStmt";

export function outListStmt(iterator: TokenIterator): void {
  outStmt(iterator); // Parse the first <out>
  restOutListStmt(iterator); // Parse the rest of the list
}
