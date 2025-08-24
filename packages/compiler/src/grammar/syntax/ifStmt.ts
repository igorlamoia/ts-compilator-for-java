import { TokenIterator } from "../../token/TokenIterator";
import { TOKENS } from "../../token/constants";
import { exprStmt } from "./exprStmt";
import { stmt } from "./stmt";
import { elsePartStmt } from "./elsePartStmt";
import { Emitter } from "../../ir/emitter";

/**
 * Parses an if-statement with optional else, and emits control flow instructions.
 *
 * @derivation `<ifStmt> → if '(' <expr> ')' <stmt> <elsePart>`
 */
export function ifStmt(iterator: TokenIterator, emitter: Emitter): void {
  iterator.consume(TOKENS.RESERVEDS.if);
  iterator.consume(TOKENS.SYMBOLS.left_paren);

  const condResult = exprStmt(iterator, emitter); // resultado da condição

  iterator.consume(TOKENS.SYMBOLS.right_paren);

  const labelTrue = emitter.newLabel();
  const labelFalse = emitter.newLabel();
  const labelEnd = emitter.newLabel();

  // Gerar instrução condicional: IF condResult ? labelTrue : labelFalse
  emitter.emit("IF", condResult, labelTrue, labelFalse);

  // Início do bloco "if"
  emitter.emit("LABEL", labelTrue, null, null);
  stmt(iterator, emitter); // bloco do if

  // Pular o else após executar o if
  emitter.emit("JUMP", labelEnd, null, null);

  // Início do bloco "else"
  emitter.emit("LABEL", labelFalse, null, null);
  elsePartStmt(iterator, emitter); // bloco do else (se houver)

  // Label final
  emitter.emit("LABEL", labelEnd, null, null);
}
