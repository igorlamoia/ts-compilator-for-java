import { TokenIterator } from "../../token/TokenIterator";
import { TOKENS } from "../../token/constants";
import { typeStmt } from "./typeStmt";
import { blockStmt } from "./blockStmt";
import { parameterListStmt } from "./parameterListStmt";

/**
 * Parses a function declaration with optional parameters.
 * Emits a LABEL for the function body and processes its block.
 *
 * @derivation `<function*> → <type> IDENT '(' <paramList> ')' <bloco>`
 */
export function functionCall(iterator: TokenIterator): void {
  const { left_paren, right_paren } = TOKENS.SYMBOLS;

  typeStmt(iterator, true); // tipo de retorno (int, float, string, void)
  const identifier = iterator.consume(TOKENS.LITERALS.identifier); // nome da função

  iterator.consume(left_paren); // (

  // Parsear lista de parâmetros
  const params = parameterListStmt(iterator);

  iterator.consume(right_paren); // )

  // Gerar um label para o corpo da função
  iterator.emitter.emit("LABEL", identifier.lexeme, null, null);

  // Emitir declarações de parâmetros
  for (const param of params) {
    iterator.emitter.emit("DECLARE", param.name, param.type, null);
  }

  // Processar o corpo da função
  blockStmt(iterator);

  // Se não houver return explícito, retornar null
  iterator.emitter.emit("RETURN", "null", null, null);
}
