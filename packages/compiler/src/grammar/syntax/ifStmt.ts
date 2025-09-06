import { TokenIterator } from "../../token/TokenIterator";
import { TOKENS } from "../../token/constants";
import { exprStmt } from "./exprStmt";
import { stmt } from "./stmt";
import { elsePartStmt } from "./elsePartStmt";

/**
 * Parses an if-statement with optional else, and emits control flow instructions.
 *
 * @derivation `<ifStmt> → if '(' <expr> ')' <stmt> <elsePart>`
 */
export function ifStmt(iterator: TokenIterator): void {
  iterator.consume(TOKENS.RESERVEDS.if);
  iterator.consume(TOKENS.SYMBOLS.left_paren);

  const condResult = exprStmt(iterator); // resultado da condição

  iterator.consume(TOKENS.SYMBOLS.right_paren);

  const labelTrue = iterator.emitter.newLabel();
  const labelFalse = iterator.emitter.newLabel();
  const labelEnd = iterator.emitter.newLabel();

  // Gerar instrução condicional: IF condResult ? labelTrue : labelFalse
  iterator.emitter.emit("IF", condResult, labelTrue, labelFalse);

  // Início do bloco "if"
  iterator.emitter.emit("LABEL", labelTrue, null, null);
  stmt(iterator); // bloco do if

  // Pular o else após executar o if
  iterator.emitter.emit("JUMP", labelEnd, null, null);

  // Início do bloco "else"
  iterator.emitter.emit("LABEL", labelFalse, null, null);
  elsePartStmt(iterator); // bloco do else (se houver)

  // Label final
  iterator.emitter.emit("LABEL", labelEnd, null, null);
}
