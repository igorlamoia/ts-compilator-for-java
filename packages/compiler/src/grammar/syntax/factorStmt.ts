import { TokenIterator } from "../../token/TokenIterator";
import { TOKENS } from "../../token/constants";
import { exprStmt } from "./exprStmt";

/**
 * Parses a factor: literals, identifiers, or parenthesized expressions.
 * Returns a value or variable name.
 *
 * @returns string representing the result
 */
export function factorStmt(iterator: TokenIterator): string {
  const token = iterator.peek();
  const { LITERALS, SYMBOLS } = TOKENS;

  // Identificadores e literais
  if (Object.values(LITERALS).includes(token.type)) {
    return iterator.consume(token.type).lexeme;
  }

  // Parênteses: (expr)
  if (iterator.match(SYMBOLS.left_paren)) {
    iterator.consume(SYMBOLS.left_paren);
    const inner = exprStmt(iterator);
    iterator.consume(SYMBOLS.right_paren, ")");
    return inner;
  }

  throw new Error(
    `Unexpected token "${token.lexeme}" at line ${token.line}, column ${token.column}.`
  );
}
