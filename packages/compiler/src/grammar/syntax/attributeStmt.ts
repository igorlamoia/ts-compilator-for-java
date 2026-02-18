import { TOKENS } from "../../token/constants";
import { TokenIterator } from "../../token/TokenIterator";
import { exprStmt } from "./exprStmt";
/**
 * Processes an attribute statement by first parsing an identifier token,
 *  and then call the expression statement.
 *
 * @derivation `<atrib> -> 'IDENT' '=' <expr> | 'IDENT' '+=' <expr> | 'IDENT' '-=' <expr> | 'IDENT' '\*=' <expr> | 'IDENT' '/=' <expr> | 'IDENT' '%=' <expr>`
 */
export function attributeStmt(iterator: TokenIterator): void {
  const { plus } = TOKENS.ARITHMETICS;

  // Prefix increment statement: ++identifier
  if (iterator.peek().type === plus && iterator.peek().lexeme === "++") {
    iterator.consume(plus, "++");
    const identifier = iterator.consume(TOKENS.LITERALS.identifier);
    const incremented = iterator.emitter.newTemp();
    iterator.emitter.emit("+", incremented, identifier.lexeme, "1");
    iterator.emitter.emit("=", identifier.lexeme, incremented, null);
    return;
  }

  const token = iterator.consume(TOKENS.LITERALS.identifier);

  // Postfix increment statement: identifier++
  if (iterator.peek().type === plus && iterator.peek().lexeme === "++") {
    iterator.consume(plus, "++");
    const incremented = iterator.emitter.newTemp();
    iterator.emitter.emit("+", incremented, token.lexeme, "1");
    iterator.emitter.emit("=", token.lexeme, incremented, null);
    return;
  }

  if (!Object.values(TOKENS.ASSIGNMENTS).includes(iterator.peek().type))
    iterator.throwError(
      "grammar.invalid_assignment_operator",
      token.line,
      token.column,
      { lexeme: token.lexeme, line: token.line, column: token.column },
    );
  const assignmentType = iterator.peek().type;
  iterator.consume(assignmentType);
  emitAssignmentChain(iterator, token.lexeme, assignmentType);
}

export function emitAssignmentChain(
  iterator: TokenIterator,
  firstTarget: string,
  firstAssignmentType: number = TOKENS.ASSIGNMENTS.equal,
): void {
  const { equal } = TOKENS.ASSIGNMENTS;
  const targets: string[] = [firstTarget];

  // Right-associative chain: a = b = c = expr
  // After the first '=', keep consuming IDENT '=' pairs.
  if (firstAssignmentType === equal) {
    while (iterator.peek().type === TOKENS.LITERALS.identifier) {
      const nextToken = iterator.peekAt(1);
      if (!nextToken || nextToken.type !== equal) break;
      const nextTarget = iterator.consume(TOKENS.LITERALS.identifier);
      iterator.consume(equal);
      targets.push(nextTarget.lexeme);
    }
  }

  const value = exprStmt(iterator);
  let currentValue = value;

  for (let i = targets.length - 1; i >= 0; i--) {
    iterator.emitter.emit("=", targets[i], currentValue, null);
    currentValue = targets[i];
  }
}
