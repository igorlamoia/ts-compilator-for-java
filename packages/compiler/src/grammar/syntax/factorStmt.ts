import { TokenIterator } from "../../token/TokenIterator";
import { TOKENS } from "../../token/constants";
import { IssueError } from "../../issue";
import { exprStmt } from "./exprStmt";
import { functionCallExpr } from "./functionCallExpr";

/**
 * Parses a factor: literals, identifiers, function calls, or parenthesized expressions.
 * Returns a value or variable name.
 *
 * @returns string representing the result
 */
export function factorStmt(iterator: TokenIterator): string {
  const token = iterator.peek();
  const { LITERALS, SYMBOLS } = TOKENS;

  // Identificadores: podem ser variáveis ou chamadas de função
  if (token.type === LITERALS.identifier) {
    const identifier = iterator.consume(LITERALS.identifier);

    // Verificar se é chamada de função (seguido por '(')
    if (iterator.peek().type === SYMBOLS.left_paren) {
      return functionCallExpr(iterator, identifier.lexeme);
    }

    // Caso contrário, é apenas uma variável
    return identifier.lexeme;
  }

  // Outros literais (números, strings)
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

  throw new IssueError(
    `Unexpected token "${token.lexeme}" at line ${token.line}, column ${token.column}.`,
    token.line,
    token.column
  );
}
