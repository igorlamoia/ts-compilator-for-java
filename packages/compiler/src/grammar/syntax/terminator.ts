import { TokenIterator } from "../../token/TokenIterator";
import { TOKENS } from "../../token/constants";

export function skipNewlines(iterator: TokenIterator): void {
  while (iterator.hasNext() && iterator.match(TOKENS.SYMBOLS.newline)) {
    iterator.consume(TOKENS.SYMBOLS.newline);
  }
}

export function consumeStmtTerminator(iterator: TokenIterator): void {
  if (!iterator.hasNext()) return;

  if (iterator.match(TOKENS.SYMBOLS.semicolon)) {
    iterator.consume(TOKENS.SYMBOLS.semicolon);
    skipNewlines(iterator);
    return;
  }

  if (iterator.match(TOKENS.SYMBOLS.newline)) {
    skipNewlines(iterator);
    return;
  }

  if (iterator.match(TOKENS.SYMBOLS.right_brace)) return;

  const token = iterator.peek();
  iterator.throwError(
    "grammar.unexpected_statement",
    token.line,
    token.column,
    { lexeme: token.lexeme },
  );
}
