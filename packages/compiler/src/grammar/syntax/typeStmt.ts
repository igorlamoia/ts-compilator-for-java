import { TokenIterator } from "../../token/TokenIterator";
import { TOKENS } from "../../token/constants";

/**
 * Parses a type declaration: `int`, `float`, `string`, or optionally `void`.
 *
 * @param iterator - The token iterator
 * @param allowVoid - Whether to allow `void` type (default: false)
 * @returns The type name as a string ("int", "float", "string", or "void")
 */
export function typeStmt(iterator: TokenIterator, allowVoid: boolean = false): string {
  const { int, float, string, void: voidType } = TOKENS.RESERVEDS;
  const token = iterator.peek();
  const validTypes = allowVoid
    ? [int, float, string, voidType]
    : [int, float, string];

  if (!validTypes.includes(token.type)) {
    throw new Error(
      `Unexpected type "${token.lexeme}" at line ${token.line}, column ${token.column}.`
    );
  }

  return iterator.consume(token.type).lexeme; // retorna "int", "float", "string", ou "void"
}
