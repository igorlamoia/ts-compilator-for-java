import { TokenIterator } from "../../token/TokenIterator";
import { TOKENS } from "../../token/constants";

/**
 * Parses a single output value: string literal, identifier, or number.
 *
 * @returns The value's lexeme (e.g., `"x"`, `"42"`, `"mensagem"`)
 */
export function outStmt(iterator: TokenIterator): string {
  const token = iterator.peek();

  if (!Object.values(TOKENS.LITERALS).includes(token.type)) {
    throw new Error(`Unexpected output token: ${token.lexeme}`);
  }

  return iterator.consume(token.type).lexeme;
}
