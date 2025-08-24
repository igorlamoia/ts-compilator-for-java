import { TokenIterator } from "../../token/TokenIterator";
import { TOKENS } from "../../token/constants";
import { typeStmt } from "./typeStmt";
import { identListStmt } from "./identListStmt";

/**
 * Parses a variable declaration statement and emits declaration instructions.
 *
 * @derivation `<declaration> -> <type> <identList> ';'`
 */
export function declarationStmt(iterator: TokenIterator): void {
  const type = typeStmt(iterator); // "int", "float", "string"
  const identifiers = identListStmt(iterator); // ["x", "y", "z"]

  for (const ident of identifiers) {
    iterator.emitter.emit("DECLARE", ident, type, null); // código intermediário
  }

  iterator.consume(TOKENS.SYMBOLS.semicolon);
}
