import { TOKENS } from "../../token/constants";
import { TokenIterator } from "../../token/TokenIterator";
import { exprStmt } from "./exprStmt";

// <atrib> -> 'IDENT' '=' <expr>
// | 'IDENT' '+=' <expr>
// | 'IDENT' '-=' <expr>
// | 'IDENT' '\*=' <expr>
// | 'IDENT' '/=' <expr>
// | 'IDENT' '%=' <expr>;
export function attributeStmt(iterator: TokenIterator): void {
  const token = iterator.consume(TOKENS.LITERALS.identifier);
  if (!Object.values(TOKENS.ASSIGNMENTS).includes(token.type))
    throw new Error(
      `Invalid assignment operator "${token.lexeme}" at line ${token.line}, column ${token.column}.`
    );
  iterator.consume(token.type);
  exprStmt(iterator);
}
