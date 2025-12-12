import { TokenIterator } from "../../token/TokenIterator";
import { TOKENS } from "../../token/constants";
import { exprStmt } from "./exprStmt";

/**
 * Parses an argument list in a function call.
 *
 * @derivation `<argList> → <expr> { ',' <expr> } | ε`
 *
 * @returns Array of expression results (temporaries or values)
 */
export function argumentListStmt(iterator: TokenIterator): string[] {
  const args: string[] = [];

  // Verifica se tem argumentos (se próximo token é ')', lista vazia)
  if (iterator.peek().type === TOKENS.SYMBOLS.right_paren) {
    return args; // sem argumentos
  }

  // Primeiro argumento
  args.push(exprStmt(iterator));

  // Argumentos subsequentes: , expr
  while (iterator.peek().type === TOKENS.SYMBOLS.comma) {
    iterator.consume(TOKENS.SYMBOLS.comma);
    args.push(exprStmt(iterator));
  }

  return args;
}
