import { TOKENS } from "../../token/constants";
import { TokenIterator } from "../../token/TokenIterator";
import { unitaryStmt } from "./unitaryStmt";

/**
 * Parses the rest of the multiplication statement.
 * and calls the unitaryStmt function
 * or does nothing.
 *
 * @derivation `<restMultStmt> -> '*' <unitaryStmt> <restMultStmt> | '/' <unitaryStmt> <restMultStmt> | '%' <unitaryStmt> <restMultStmt> | &`
 */
export function restMultStmt(iterator: TokenIterator): void {
  const { star, slash, modulo } = TOKENS.ARITHMETICS;
  while ([star, slash, modulo].includes(iterator.peek().type)) {
    iterator.consume(iterator.peek().type); // Consume `*`, `/`, or `%`
    unitaryStmt(iterator);
  }
}
