import { TOKENS } from "../../token/constants";
import { TokenIterator } from "../../token/TokenIterator";
import { listStmt } from "./listStmt";

export function blockStmt(iterator: TokenIterator): void {
  const { left_brace, right_brace } = TOKENS.SYMBOLS;
  iterator.consume(left_brace, "{");
  listStmt(iterator);
  iterator.consume(right_brace, "}");
}
