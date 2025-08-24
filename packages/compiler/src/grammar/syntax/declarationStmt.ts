import { TokenIterator } from "../../token/TokenIterator";
import { TOKENS } from "../../token/constants";
import { typeStmt } from "./typeStmt";
import { identListStmt } from "./identListStmt";
import { Emitter } from "../../ir/emitter";

/**
 * Parses a variable declaration statement and emits declaration instructions.
 *
 * @derivation `<declaration> -> <type> <identList> ';'`
 */
export function declarationStmt(
  iterator: TokenIterator,
  emitter: Emitter
): void {
  const type = typeStmt(iterator); // "int", "float", "string"
  const identifiers = identListStmt(iterator); // ["x", "y", "z"]

  for (const ident of identifiers) {
    emitter.emit("DECLARE", ident, type, null); // código intermediário
  }

  iterator.consume(TOKENS.SYMBOLS.semicolon);
}
