import { TokenIterator } from "../../token/TokenIterator";
import { TOKENS } from "../../token/constants";

/**
 * Parses a type declaration: `int`, `float`, or `string`.
 *
 * @returns The type name as a string ("int", "float", or "string")
 */
export function typeStmt(iterator: TokenIterator): string {
  const { int, float, string } = TOKENS.RESERVEDS;
  const token = iterator.peek();
  const validTypes = [int, float, string];

  if (!validTypes.includes(token.type)) {
    throw new Error(
      `Unexpected type "${token.lexeme}" at line ${token.line}, column ${token.column}.`
    );
  }

  return iterator.consume(token.type).lexeme; // retorna "int", "float", ou "string"
}
