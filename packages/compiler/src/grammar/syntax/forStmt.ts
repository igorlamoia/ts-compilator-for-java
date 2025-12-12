import { TokenIterator } from "../../token/TokenIterator";
import { TOKENS } from "../../token/constants";
import { optAttributeStmt } from "./optAttributeStmt";
import { optExprStmt } from "./optExprStmt";
import { stmt } from "./stmt";

/**
 * Parses a `for` loop and emits control flow instructions.
 *
 * @derivation `<forStmt> -> for '(' <optAtrib> ';' <optExpr> ';' <optAtrib> ')' <stmt>`
 */
export function forStmt(iterator: TokenIterator): void {
  const { left_paren, right_paren, semicolon } = TOKENS.SYMBOLS;

  iterator.consume(TOKENS.RESERVEDS.for);
  iterator.consume(left_paren);

  // (1) Init
  optAttributeStmt(iterator);
  iterator.consume(semicolon);

  const labelStart = iterator.emitter.newLabel();
  const labelBody = iterator.emitter.newLabel();
  const labelIncrement = iterator.emitter.newLabel();
  const labelEnd = iterator.emitter.newLabel();

  iterator.emitter.emit("LABEL", labelStart, null, null);

  // (2) Cond
  const conditionResult = optExprStmt(iterator);
  iterator.consume(semicolon);

  if (conditionResult !== null) {
    iterator.emitter.emit("IF", conditionResult, labelBody, labelEnd);
  } else {
    iterator.emitter.emit("JUMP", labelBody, null, null);
  }

  // (3) Incremento — ANTES de consumir o ')'
  iterator.emitter.emit("LABEL", labelIncrement, null, null);
  optAttributeStmt(iterator);
  iterator.emitter.emit("JUMP", labelStart, null, null);

  iterator.consume(right_paren); // ✅ depois do incremento

  // (4) Corpo
  iterator.emitter.emit("LABEL", labelBody, null, null);

  // Push loop context for break/continue
  iterator.pushLoopContext(labelEnd, labelIncrement);

  stmt(iterator);

  // Pop loop context
  iterator.popLoopContext();

  iterator.emitter.emit("JUMP", labelIncrement, null, null);

  // (5) Fim
  iterator.emitter.emit("LABEL", labelEnd, null, null);
}
