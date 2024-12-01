import { TOKENS } from "../../token/constants";
import { TokenIterator } from "../../token/TokenIterator";
import { multStmt } from "./multStmt";

export function addStmt(iterator: TokenIterator): void {
  const { minus, plus } = TOKENS.ARITHMETICS;
  multStmt(iterator);
  while ([minus, plus].includes(iterator.peek().type)) {
    iterator.next(); // Consume `+` or `-`
    multStmt(iterator);
  }
}
