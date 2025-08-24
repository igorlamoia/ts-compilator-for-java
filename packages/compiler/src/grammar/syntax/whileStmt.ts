import { TokenIterator } from "../../token/TokenIterator";
import { TOKENS } from "../../token/constants";
import { exprStmt } from "./exprStmt";
import { stmt } from "./stmt";
import { Emitter } from "../../ir/emitter";

/**
 * Parses a while-loop and emits control flow instructions.
 *
 * @derivation `<whileStmt> → while '(' <expr> ')' <stmt>`
 */
export function whileStmt(iterator: TokenIterator, emitter: Emitter): void {
  iterator.consume(TOKENS.RESERVEDS.while);
  iterator.consume(TOKENS.SYMBOLS.left_paren);

  const labelStart = emitter.newLabel(); // Início do laço
  const labelBody = emitter.newLabel(); // Onde executa o corpo
  const labelEnd = emitter.newLabel(); // Fim do laço

  emitter.emit("LABEL", labelStart, null, null);

  const conditionResult = exprStmt(iterator, emitter); // condicional

  emitter.emit("IF", conditionResult, labelBody, labelEnd);
  emitter.emit("LABEL", labelBody, null, null);

  iterator.consume(TOKENS.SYMBOLS.right_paren);

  stmt(iterator, emitter); // corpo do laço

  emitter.emit("JUMP", labelStart, null, null);
  emitter.emit("LABEL", labelEnd, null, null);
}
