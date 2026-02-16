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

    // Postfix increment: identifier++
    if (
      iterator.peek().type === TOKENS.ARITHMETICS.plus &&
      iterator.peek().lexeme === "++"
    ) {
      iterator.consume(TOKENS.ARITHMETICS.plus, "++");
      const previous = iterator.emitter.newTemp();
      const incremented = iterator.emitter.newTemp();
      iterator.emitter.emit("=", previous, identifier.lexeme, null);
      iterator.emitter.emit("+", incremented, identifier.lexeme, "1");
      iterator.emitter.emit("=", identifier.lexeme, incremented, null);
      return previous;
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
    "grammar.unexpected_token",
    token.line,
    token.column,
    { lexeme: token.lexeme, line: token.line, column: token.column }
  );
}
