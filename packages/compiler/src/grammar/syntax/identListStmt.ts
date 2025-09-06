import { TokenIterator } from "../../token/TokenIterator";
import { TOKENS } from "../../token/constants";
import { restIdentListStmt } from "./restIdentListStmt";

/**
 * Parses a comma-separated list of identifiers.
 *
 * @returns Array of identifier names
 */
export function identListStmt(iterator: TokenIterator): string[] {
  const identifiers: string[] = [];

  const first = iterator.consume(TOKENS.LITERALS.identifier);
  identifiers.push(first.lexeme);

  const rest = restIdentListStmt(iterator);
  return identifiers.concat(rest);
}
