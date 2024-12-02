import { TOKENS } from "../../token/constants";
import { TokenIterator } from "../../token/TokenIterator";

// <out> -> 'STR' | 'IDENT' | 'NUMdec' | 'NUMfloat' | 'NUMoct' | 'NUMhex';
export function outStmt(iterator: TokenIterator): void {
  const token = iterator.peek();
  if (!Object.values(TOKENS.LITERALS).includes(token.type))
    throw new Error(`Unexpected output token: ${token.lexeme}`);
  iterator.consume(token.type);
}
