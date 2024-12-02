import { TOKENS } from "../../token/constants";
import { TokenIterator } from "../../token/TokenIterator";
import { multStmt } from "./multStmt";

// <restoAdd> -> '+' <mult> <restoAdd>
// | '-' <mult> <restoAdd> | & ;
export function restAddStmt(iterator: TokenIterator): void {
  const { minus, plus } = TOKENS.ARITHMETICS;
  while ([minus, plus].includes(iterator.peek().type)) {
    iterator.consume(iterator.peek().type);
    multStmt(iterator);
  }
}
