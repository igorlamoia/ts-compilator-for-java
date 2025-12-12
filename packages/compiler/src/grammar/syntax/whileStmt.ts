import { TokenIterator } from "../../token/TokenIterator";
import { TOKENS } from "../../token/constants";
import { exprStmt } from "./exprStmt";
import { stmt } from "./stmt";

/**
 * Parses a while-loop and emits control flow instructions.
 *
 * @derivation `<whileStmt> → while '(' <expr> ')' <stmt>`
 */
export function whileStmt(iterator: TokenIterator): void {
  iterator.consume(TOKENS.RESERVEDS.while);
  iterator.consume(TOKENS.SYMBOLS.left_paren);

  const labelStart = iterator.emitter.newLabel(); // Início do laço
  const labelBody = iterator.emitter.newLabel(); // Onde executa o corpo
  const labelEnd = iterator.emitter.newLabel(); // Fim do laço

  iterator.emitter.emit("LABEL", labelStart, null, null);

  const conditionResult = exprStmt(iterator); // condicional

  iterator.emitter.emit("IF", conditionResult, labelBody, labelEnd);
  iterator.emitter.emit("LABEL", labelBody, null, null);

  iterator.consume(TOKENS.SYMBOLS.right_paren);

  // Push loop context for break/continue
  iterator.pushLoopContext(labelEnd, labelStart);

  stmt(iterator); // corpo do laço

  // Pop loop context
  iterator.popLoopContext();

  iterator.emitter.emit("JUMP", labelStart, null, null);
  iterator.emitter.emit("LABEL", labelEnd, null, null);
}
