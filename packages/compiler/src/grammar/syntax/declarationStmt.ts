import { TOKENS } from "../../token/constants";
import { typeStmt } from "./typeSmt";
import { identListStmt } from "./identListStmt";
import { TokenIterator } from "../../token/TokenIterator";

/**
 * Processes a declaration statement by first parsing a type statement
 * and then parsing an identifier list statement.
 *
 * @derivation `<declaration> -> <type> <identList> ';'`
 */
export function declarationStmt(iterator: TokenIterator): void {
  typeStmt(iterator); // Parse the type
  identListStmt(iterator); // Parse the identifier list
  iterator.consume(TOKENS.SYMBOLS.semicolon);
}
