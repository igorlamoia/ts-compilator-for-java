import { TokenIterator } from "../../token/TokenIterator";
import { exprStmt } from "./exprStmt";
import { TOKENS } from "../../token/constants";

/**
 * Processes a factor statement by parsing a literal token or an expression.
 *
 * @derivation `<factor> -> 'NUMint' | 'NUMfloat' | 'NUMoct' | 'NUMhex' | 'IDENT' | '(' <expr> ')' | 'STR'`
 */
export function factorStmt(iterator: TokenIterator): void {
  const token = iterator.peek();
  if (Object.values(TOKENS.LITERALS).includes(token.type)) {
    iterator.consume(token.type);
    return;
  } else if (iterator.match(TOKENS.SYMBOLS.left_paren)) {
    iterator.consume(TOKENS.SYMBOLS.left_paren);
    exprStmt(iterator);
    iterator.consume(TOKENS.SYMBOLS.right_paren, ")");
    return;
  }
  throw new Error(
    `Unexpected token "${token.lexeme}" at line ${token.line}, column ${token.column}.`
  );
}
