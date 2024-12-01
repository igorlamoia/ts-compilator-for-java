import { TOKENS } from "../../token/constants";
import { TokenIterator } from "../../token/TokenIterator";

export function outStmt(iterator: TokenIterator): void {
  const token = iterator.peek();
  if (Object.values(TOKENS.LITERALS).includes(token.type)) {
    iterator.next(); // Consume valid output token
  } else {
    throw new Error(`Unexpected output token: ${token.lexeme}`);
  }
}
