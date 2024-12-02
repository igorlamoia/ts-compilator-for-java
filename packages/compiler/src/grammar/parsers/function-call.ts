import { TokenIterator } from "../../token/TokenIterator";
import { typeStmt } from "./typeSmt";
import { TOKENS } from "../../token/constants";
import { blockStmt } from "./blockStmt";

// <functionCall\*> -> <typeStmt> 'IDENT' '(' ')' <bloco> ;
export function functionCall(iterator: TokenIterator): void {
  const { left_paren, right_paren } = TOKENS.SYMBOLS;
  typeStmt(iterator);
  iterator.consume(TOKENS.LITERALS.identifier);
  iterator.consume(left_paren);
  iterator.consume(right_paren);
  blockStmt(iterator);
}
