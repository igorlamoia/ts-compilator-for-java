import { TOKENS } from "../../token/constants";
import { TokenIterator } from "../../token/TokenIterator";
import { factorStmt } from "./factorStmt";

/**
 * Parses the unitary statement.
 *
 * @derivation `<unitaryStmt> -> '+' <unitaryStmt> | '-' <unitaryStmt> | <factorStmt>`
 */
export function unitaryStmt(iterator: TokenIterator): void {
  const token = iterator.peek();
  const { minus, plus } = TOKENS.ARITHMETICS;
  if (![minus, plus].includes(token.type)) return factorStmt(iterator);

  iterator.consume(token.type);
  unitaryStmt(iterator);
}
