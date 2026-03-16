import { TokenIterator } from "../../token/TokenIterator";
import { Token } from "../../token";
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
    const arrayDeclaration = readArrayDeclaration(iterator, arrayMode);

    if (arrayDeclaration.dimensions > 0) {
      iterator.declareSymbolDescriptor(varName, {
        kind: "array",
        baseType: type,
        dimensions: arrayDeclaration.dimensions,
        arrayMode: arrayDeclaration.mode,
        sizes: arrayDeclaration.sizes,
      });
      emitter.emit(
        "DECLARE_ARRAY" as never,
        varName,
        type,
        JSON.stringify(arrayDeclaration),
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

export function declareUntypedDynamicArray(
  iterator: TokenIterator,
  identToken: Token,
): void {
  iterator.consume(TOKENS.SYMBOLS.left_bracket);
  iterator.consume(TOKENS.SYMBOLS.right_bracket);
  iterator.consume(TOKENS.ASSIGNMENTS.equal);
  iterator.consume(TOKENS.SYMBOLS.left_bracket);
  iterator.consume(TOKENS.SYMBOLS.right_bracket);

  iterator.declareSymbolDescriptor(identToken.lexeme, {
    kind: "array",
    baseType: "dynamic",
    dimensions: 1,
    arrayMode: "dynamic",
    sizes: [],
  });
  iterator.emitter.emit(
    "DECLARE_ARRAY" as never,
    identToken.lexeme,
    "dynamic",
    JSON.stringify({
      mode: "dynamic",
      dimensions: 1,
      sizes: [],
    }),
  );
  consumeStmtTerminator(iterator);
}

type ParsedArrayDeclaration = {
  mode: "fixed" | "dynamic";
  dimensions: number;
  sizes: number[];
};

function readArrayDeclaration(
  iterator: TokenIterator,
  arrayMode: "fixed" | "dynamic" | null,
): ParsedArrayDeclaration {
  const sizes: number[] = [];
  let dimensions = 0;

  while (iterator.match(TOKENS.SYMBOLS.left_bracket)) {
    iterator.consume(TOKENS.SYMBOLS.left_bracket);
    const sizeToken = iterator.peek();

    if (arrayMode === "dynamic") {
      if (sizeToken.type !== TOKENS.SYMBOLS.right_bracket) {
        iterator.throwError(
          "grammar.unexpected_statement",
          sizeToken.line,
          sizeToken.column,
          { lexeme: sizeToken.lexeme },
        );
      }
      iterator.consume(TOKENS.SYMBOLS.right_bracket);
      dimensions++;
      continue;
    }

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
        sizeToken.line,
        sizeToken.column,
        { lexeme: sizeToken.lexeme },
      );
    }

    iterator.consume(TOKENS.SYMBOLS.right_bracket);
    sizes.push(parsedSize);
    dimensions++;
  }

  return {
    mode: arrayMode ?? "fixed",
    dimensions,
    sizes,
  };
}

// import { identListStmt } from "./identListStmt";
