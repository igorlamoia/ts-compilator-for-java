import {
  FunctionParameterDescriptor,
  ScalarType,
  TokenIterator,
} from "../../token/TokenIterator";
import { TOKENS } from "../../token/constants";
import { typeStmt } from "./typeStmt";
import { readArrayDeclaration } from "./declarationStmt";

export type Parameter = { name: string } & FunctionParameterDescriptor;

/**
 * Parses a parameter list in function declaration.
 *
 * @derivation `<paramList> → <param> { ',' <param> } | ε`
 * @derivation `<param> → <type> IDENT`
 *
 * @returns Array of parameters
 */
export function parameterListStmt(iterator: TokenIterator): Parameter[] {
  const params: Parameter[] = [];
  const typingMode = iterator.getTypingMode();

  // Verifica se tem parâmetros (se próximo token é ')', lista vazia)
  if (iterator.peek().type === TOKENS.SYMBOLS.right_paren) {
    return params; // lista vazia
  }

  if (typingMode === "untyped") {
    const paramName = iterator.consume(TOKENS.LITERALS.identifier);
    params.push({ kind: "scalar", type: "dynamic", name: paramName.lexeme });

    while (iterator.peek().type === TOKENS.SYMBOLS.comma) {
      iterator.consume(TOKENS.SYMBOLS.comma);
      const nextName = iterator.consume(TOKENS.LITERALS.identifier);
      params.push({ kind: "scalar", type: "dynamic", name: nextName.lexeme });
    }
    return params;
  }

  params.push(parseTypedParameter(iterator));

  while (iterator.peek().type === TOKENS.SYMBOLS.comma) {
    iterator.consume(TOKENS.SYMBOLS.comma);
    params.push(parseTypedParameter(iterator));
  }

  return params;
}

function parseTypedParameter(iterator: TokenIterator): Parameter {
  const baseType = typeStmt(iterator);
  const paramName = iterator.consume(TOKENS.LITERALS.identifier);

  if (!iterator.match(TOKENS.SYMBOLS.left_bracket)) {
    return {
      kind: "scalar",
      type: baseType,
      name: paramName.lexeme,
    };
  }

  const arrayDeclaration = readArrayDeclaration(
    iterator,
    iterator.getArrayMode(),
  );

  return {
    kind: "array",
    baseType,
    dimensions: arrayDeclaration.dimensions,
    arrayMode: arrayDeclaration.mode,
    sizes: arrayDeclaration.sizes,
    name: paramName.lexeme,
  };
}
