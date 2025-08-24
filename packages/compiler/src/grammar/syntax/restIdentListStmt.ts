import { TokenIterator } from "../../token/TokenIterator";
import { TOKENS } from "../../token/constants";

/**
 * Parses the remaining part of a comma-separated identifier list.
 *
 * @returns Array of identifier names (strings)
 */
export function restIdentListStmt(iterator: TokenIterator): string[] {
  const identifiers: string[] = [];

  while (iterator.match(TOKENS.SYMBOLS.comma)) {
    iterator.consume(TOKENS.SYMBOLS.comma);

    const ident = iterator.consume(TOKENS.LITERALS.identifier);
    identifiers.push(ident.lexeme);
  }

  return identifiers;
}
