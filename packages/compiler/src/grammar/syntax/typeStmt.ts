import { TokenIterator, ScalarType } from "../../token/TokenIterator";
import { TOKENS } from "../../token/constants";

/**
 * Parses a type declaration: `int`, `float`, `bool`, `string`, or optionally `void`.
 *
 * @param iterator - The token iterator
 * @param allowVoid - Whether to allow `void` type (default: false)
 * @returns The type name as a string ("int", "float", "bool", "string", or "void")
 */
export function typeStmt(
  iterator: TokenIterator,
  allowVoid: boolean = false,
): ScalarType {
  const { int, float, bool, string, void: voidType } = TOKENS.RESERVEDS;
  const token = iterator.peek();
  const validTypes = allowVoid
    ? [int, float, bool, string, voidType]
    : [int, float, bool, string];

  if (!validTypes.includes(token.type)) {
    iterator.throwError("grammar.unexpected_type", token.line, token.column, {
      lexeme: token.lexeme,
      line: token.line,
      column: token.column,
    });
  }

  iterator.consume(token.type);
  return iterator.mapTokenTypeToSemanticType(token.type);
}
