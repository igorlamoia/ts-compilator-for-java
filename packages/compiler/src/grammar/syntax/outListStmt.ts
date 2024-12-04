import { TokenIterator } from "../../token/TokenIterator";
import { outStmt } from "./outStmt";
import { restOutListStmt } from "./restOutListStmt";

/**
 *  Parses the output list statement by calling the `outStmt` function
 * and then the `restOutListStmt` function.
 *
 * @derivation `<outList> -> <out> <restoOutList>`
 */
export function outListStmt(iterator: TokenIterator): void {
  outStmt(iterator);
  restOutListStmt(iterator);
}
