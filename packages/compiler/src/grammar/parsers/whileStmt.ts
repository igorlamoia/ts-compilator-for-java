import { TokenIterator } from "token/TokenIterator";
import { exprStmt } from "./exprStmt";
import { TOKENS } from "token/constants";
import { stmt } from "./stmt";

export function whileStmt(iterator: TokenIterator): void {
  iterator.consume(TOKENS.RESERVEDS.while);
  iterator.consume(TOKENS.SYMBOLS.left_brace);
  exprStmt(iterator);
  iterator.consume(TOKENS.SYMBOLS.right_paren);
  stmt(iterator);
}
