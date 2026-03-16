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
  const arrayMode = iterator.getArrayMode();
  const type =
    typingMode === "untyped"
      ? (iterator.consume(TOKENS.RESERVEDS.variavel), "dynamic")
      : typeStmt(iterator); // "int", "float", "string"
  const emitter = iterator.emitter;

  while (true) {
    const identToken = iterator.consume(TOKENS.LITERALS.identifier);
    const varName = identToken.lexeme;
    const dimensions = readArrayDimensions(iterator);

    if (dimensions.length > 0) {
      if (arrayMode !== "fixed") {
        iterator.throwError(
          "grammar.unexpected_statement",
          identToken.line,
          identToken.column,
          { lexeme: identToken.lexeme },
        );
      }

      iterator.declareSymbolDescriptor(varName, {
        kind: "array",
        baseType: type,
        dimensions: dimensions.length,
        arrayMode: "fixed",
        sizes: dimensions,
      });
      emitter.emit(
        "DECLARE_ARRAY" as never,
        varName,
        type,
        JSON.stringify(dimensions),
      );
    } else {
      iterator.declareSymbol(varName, type);
      emitter.emit("DECLARE", varName, type, null);
    }

    if (iterator.match(TOKENS.ASSIGNMENTS.equal)) {
      iterator.consume(TOKENS.ASSIGNMENTS.equal);
      emitAssignmentChain(iterator, varName);
    }

    if (!iterator.match(TOKENS.SYMBOLS.comma)) break;
    iterator.consume(TOKENS.SYMBOLS.comma); // consume ","
  }

  consumeStmtTerminator(iterator);
}

function readArrayDimensions(iterator: TokenIterator): number[] {
  const dimensions: number[] = [];

  while (iterator.match(TOKENS.SYMBOLS.left_bracket)) {
    const bracket = iterator.consume(TOKENS.SYMBOLS.left_bracket);
    const sizeToken = iterator.peek();

    if (sizeToken.type !== TOKENS.LITERALS.integer_literal) {
      iterator.throwError(
        "iterator.unexpected_token",
        sizeToken.line,
        sizeToken.column,
        {
          line: sizeToken.line,
          column: sizeToken.column,
          expectedType: "integer literal",
          actualType:
            TOKENS.BY_ID[sizeToken.type] !== undefined
              ? `token.${TOKENS.BY_ID[sizeToken.type]}`
              : String(sizeToken.type),
          lexeme: sizeToken.lexeme,
        },
      );
    }

    const parsedSize = Number(iterator.consume(sizeToken.type).lexeme);
    if (!Number.isInteger(parsedSize) || parsedSize <= 0) {
      iterator.throwError(
        "grammar.unexpected_statement",
        bracket.line,
        bracket.column,
        { lexeme: bracket.lexeme },
      );
    }

    iterator.consume(TOKENS.SYMBOLS.right_bracket);
    dimensions.push(parsedSize);
  }

  return dimensions;
}

// import { identListStmt } from "./identListStmt";
