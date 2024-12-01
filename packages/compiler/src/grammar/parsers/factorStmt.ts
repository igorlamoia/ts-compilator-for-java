import { TokenIterator } from "token/TokenIterator";
import { exprStmt } from "./exprStmt";
import { TOKENS } from "token/constants";

export function factorStmt(iterator: TokenIterator): void {
  const token = iterator.peek();

  if ([TOKENS.RESERVEDS.int, TOKENS.RESERVEDS.float].includes(token.type)) {
    iterator.next(); // Consume the number
  } else if (iterator.match(TOKENS.LITERALS.identifier)) {
    iterator.next(); // Consume `IDENT`
  } else if (iterator.match(TOKENS.SYMBOLS.left_paren)) {
    iterator.next(); // Consume `(`
    exprStmt(iterator); // Parse the nested expression
    iterator.consume(TOKENS.SYMBOLS.right_paren, ")");
  } else if (iterator.match(TOKENS.LITERALS.string_literal)) {
    iterator.next(); // Consume string
  } else {
    throw new Error(
      `Unexpected token "${token.lexeme}" at line ${token.line}, column ${token.column}.`
    );
  }
}
