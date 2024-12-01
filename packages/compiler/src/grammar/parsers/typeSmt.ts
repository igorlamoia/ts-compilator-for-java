import { TOKENS } from "../../token/constants";
import { TokenIterator } from "../../token/TokenIterator";

export function typeStmt(iterator: TokenIterator): void {
  const { int, float, string } = TOKENS.RESERVEDS;
  const token = iterator.peek();
  const validTypes = [int, float, string];

  if (!validTypes.includes(token.type))
    throw new Error(
      `Unexpected type "${token.lexeme}" at line ${token.line}, column ${token.column}.`
    );
  iterator.next();
}
