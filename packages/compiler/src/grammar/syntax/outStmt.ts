import { TokenIterator } from "../../token/TokenIterator";
import { TOKENS } from "../../token/constants";
import { IssueError } from "../../issue";

/**
 * Parses a single output value: string literal, identifier, or number.
 *
 * @returns The value's lexeme (e.g., `"x"`, `"42"`, `"mensagem"`)
 */
export function outStmt(iterator: TokenIterator): string {
  const token = iterator.peek();

  if (!Object.values(TOKENS.LITERALS).includes(token.type)) {
    throw new IssueError(
      `Unexpected output token: ${token.lexeme}`,
      token.line,
      token.column
    );
  }

  return iterator.consume(token.type).lexeme;
}
