import { TokenIterator } from "../../token/TokenIterator";
import { TOKENS } from "../../token/constants";
import { typeStmt } from "./typeStmt";

export interface Parameter {
  type: string;  // "int", "float", "string"
  name: string;  // nome do parâmetro
}

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

  // Verifica se tem parâmetros (se próximo token é ')', lista vazia)
  if (iterator.peek().type === TOKENS.SYMBOLS.right_paren) {
    return params; // lista vazia
  }

  // Parsear primeiro parâmetro: type identifier
  const paramType = typeStmt(iterator);
  const paramName = iterator.consume(TOKENS.LITERALS.identifier);
  params.push({ type: paramType, name: paramName.lexeme });

  // Parsear parâmetros subsequentes: , type identifier
  while (iterator.peek().type === TOKENS.SYMBOLS.comma) {
    iterator.consume(TOKENS.SYMBOLS.comma);
    const nextType = typeStmt(iterator);
    const nextName = iterator.consume(TOKENS.LITERALS.identifier);
    params.push({ type: nextType, name: nextName.lexeme });
  }

  return params;
}
