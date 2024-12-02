import { TokenIterator } from "../../token/TokenIterator";
import { exprStmt } from "./exprStmt";
import { TOKENS } from "../../token/constants";
import { stmt } from "./stmt";
import { elsePartStmt } from "./elsePartStmt";

// <ifStmt> -> 'if' '(' <expr> ')' <stmt> <elsePart> ;
export function ifStmt(iterator: TokenIterator): void {
  iterator.consume(TOKENS.RESERVEDS.if);
  iterator.consume(TOKENS.SYMBOLS.left_paren);
  exprStmt(iterator);
  iterator.consume(TOKENS.SYMBOLS.right_paren);
  stmt(iterator);
  elsePartStmt(iterator);
}
