import { TOKENS } from "../../token/constants";
import { TokenIterator } from "../../token/TokenIterator";
import { forStmt } from "./forStmt";
import { blockStmt } from "./blockStmt";
import { attributeStmt, emitAssignmentChain } from "./attributeStmt";
import { whileStmt } from "./whileStmt";
import { ifStmt } from "./ifStmt";
import { declarationStmt } from "./declarationStmt";
import { printStmt, scanStmt } from "./ioStmt";
import { returnStmt } from "./returnStmt";
import { functionCallExpr } from "./functionCallExpr";
import { breakStmt } from "./breakStmt";
import { continueStmt } from "./continueStmt";
import { switchStmt } from "./switchStmt";
import { consumeStmtTerminator } from "./statementTerminator";

/**
 * Parses a statement by calling the appropriate function
 * based on the current token.
 *
 * @derivation `<stmt> -> <forStmt> | <printStmt> | <scanStmt> | <whileStmt> | <atrib> ';' | <ifStmt> | <switchStmt> | <bloco> | <declaration> | 'break' | 'continue' | ';'`
 */
export function stmt(iterator: TokenIterator): void {
  const token = iterator.peek();
  const { RESERVEDS } = TOKENS;
  const blockMode = iterator.getBlockMode();
  const typingMode = iterator.getTypingMode();

  const stmtsFactory = {
    [RESERVEDS.for]: forStmt,
    [RESERVEDS.print]: printStmt,
    [RESERVEDS.scan]: scanStmt,
    [RESERVEDS.while]: whileStmt,
    [TOKENS.LITERALS.identifier]: attrbuteStmtVariant,
    [RESERVEDS.if]: ifStmt,
    [RESERVEDS.switch]: switchStmt,
    [TOKENS.SYMBOLS.left_brace]: blockStmt,
    ...(typingMode === "typed"
      ? {
          [RESERVEDS.int]: declarationStmt,
          [RESERVEDS.float]: declarationStmt,
          [RESERVEDS.string]: declarationStmt,
        }
      : {
          [RESERVEDS.variavel]: declarationStmt,
        }),
    [RESERVEDS.return]: returnStmt,
    [RESERVEDS.break]: breakStmt,
    [RESERVEDS.continue]: continueStmt,
    [TOKENS.ARITHMETICS.plus]: prefixIncrementStmtVariant,
  };

  // In indentation mode, a colon also starts a block
  if (blockMode === "indentation" && token.type === TOKENS.SYMBOLS.colon) {
    return blockStmt(iterator);
  }

  const goToStmt = stmtsFactory[token.type];
  if (goToStmt) return goToStmt(iterator);

  const ignoreStmts = {
    [TOKENS.SYMBOLS.semicolon]: iterator.consume.bind(iterator),
    [TOKENS.SYMBOLS.newline]: iterator.consume.bind(iterator),
  };

  const ignoreStmt = ignoreStmts[token.type];
  if (ignoreStmt) {
    ignoreStmt(token.type);
    return;
  }

  if (token.type === RESERVEDS.case) {
    iterator.throwError(
      "grammar.case_outside_switch",
      token.line,
      token.column,
      { lexeme: token.lexeme },
    );
  }

  if (token.type === RESERVEDS.default) {
    iterator.throwError(
      "grammar.default_outside_switch",
      token.line,
      token.column,
      { lexeme: token.lexeme },
    );
  }

  iterator.throwError(
    "grammar.unexpected_statement",
    token.line,
    token.column,
    { lexeme: token.lexeme },
  );
}

function prefixIncrementStmtVariant(iterator: TokenIterator): void {
  const token = iterator.peek();
  if (token.lexeme !== "++") {
    iterator.throwError(
      "grammar.unexpected_statement",
      token.line,
      token.column,
      { lexeme: token.lexeme },
    );
  }

  attributeStmt(iterator);
  consumeStmtTerminator(iterator);
}

function attrbuteStmtVariant(iterator: TokenIterator): void {
  // Consumir o identificador
  const identifier = iterator.consume(TOKENS.LITERALS.identifier);
  const { plus } = TOKENS.ARITHMETICS;

  // Verificar se é chamada de função (seguido por '(') ou atribuição (seguido por '=')
  if (iterator.peek().type === TOKENS.SYMBOLS.left_paren) {
    // É uma chamada de função
    functionCallExpr(iterator, identifier.lexeme);
    consumeStmtTerminator(iterator);
  } else if (iterator.peek().type === plus && iterator.peek().lexeme === "++") {
    // É um incremento pós-fixado
    iterator.consume(plus, "++");
    const incremented = iterator.emitter.newTemp();
    iterator.emitter.emit("+", incremented, identifier.lexeme, "1");
    iterator.emitter.emit("=", identifier.lexeme, incremented, null);
    consumeStmtTerminator(iterator);
  } else {
    // É uma atribuição - precisa processar o '=' e o resto
    iterator.consume(TOKENS.ASSIGNMENTS.equal, "=");
    emitAssignmentChain(iterator, identifier.lexeme);
    consumeStmtTerminator(iterator);
  }
}
