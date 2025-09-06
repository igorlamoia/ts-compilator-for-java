import { TokenIterator } from "../../token/TokenIterator";
import { outStmt } from "./outStmt";
import { restOutListStmt } from "./restOutListStmt";

/**
 * Parses a list of output values for `print(...)`.
 *
 * @returns Array of strings (identifiers, literals, numbers)
 */
export function outListStmt(iterator: TokenIterator): string[] {
  const first = outStmt(iterator);
  const rest = restOutListStmt(iterator);
  return [first, ...rest];
}
