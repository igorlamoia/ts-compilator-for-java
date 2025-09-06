import { TokenIterator } from "../../token/TokenIterator";
import { TOKENS } from "../../token/constants";
import { outStmt } from "./outStmt";

/**
 * Parses the remaining part of a print argument list: `, value, ...`.
 *
 * @returns Array of strings (identifiers, strings, numbers)
 */
export function restOutListStmt(iterator: TokenIterator): string[] {
  const { comma } = TOKENS.SYMBOLS;
  const items: string[] = [];

  while (iterator.match(comma)) {
    iterator.consume(comma);
    const value = outStmt(iterator);
    items.push(value);
  }

  return items;
}
