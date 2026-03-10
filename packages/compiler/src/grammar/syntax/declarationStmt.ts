import { TokenIterator } from "../../token/TokenIterator";
import { TOKENS } from "../../token/constants";
import { typeStmt } from "./typeStmt";
import { emitAssignmentChain } from "./attributeStmt";
import { consumeStmtTerminator } from "./statementTerminator";

/**
 * Parses a variable declaration statement and emits declaration instructions.
 *
 * @derivation `<declaration> -> <type> <identList> ';'`
 */
export function declarationStmt(iterator: TokenIterator): void {
  const typingMode = iterator.getTypingMode();
  const type =
    typingMode === "untyped"
      ? (iterator.consume(TOKENS.RESERVEDS.variavel), "dynamic")
      : typeStmt(iterator); // "int", "float", "string"
  const emitter = iterator.emitter;

  while (true) {
    const identToken = iterator.consume(TOKENS.LITERALS.identifier);
    const varName = identToken.lexeme;
    iterator.declareSymbol(varName, type);

    emitter.emit("DECLARE", varName, type, null);

    if (iterator.match(TOKENS.ASSIGNMENTS.equal)) {
      iterator.consume(TOKENS.ASSIGNMENTS.equal);
      emitAssignmentChain(iterator, varName);
    }

    if (!iterator.match(TOKENS.SYMBOLS.comma)) break;
    iterator.consume(TOKENS.SYMBOLS.comma); // consume ","
  }

  consumeStmtTerminator(iterator);
}

// import { identListStmt } from "./identListStmt";
