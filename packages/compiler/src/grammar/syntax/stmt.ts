import { TOKENS } from "../../token/constants";
import { TokenIterator } from "../../token/TokenIterator";
import { forStmt } from "./forStmt";
import { blockStmt } from "./blockStmt";
import { attributeStmt } from "./attributeStmt";
import { whileStmt } from "./whileStmt";
import { ifStmt } from "./ifStmt";
import { declarationStmt } from "./declarationStmt";
import { ioStmt } from "./ioStmt";
import { returnStmt } from "./returnStmt";
import { functionCallExpr } from "./functionCallExpr";

/**
 * Parses a statement by calling the appropriate function
 * based on the current token.
 *
 * @derivation `<stmt> -> <forStmt> | <ioStmt> | <whileStmt> | <atrib> ';' | <ifStmt> | <bloco> | <declaration> | 'break' | 'continue' | ';'`
 */
export function stmt(iterator: TokenIterator): void {
  const token = iterator.peek();
  const { RESERVEDS } = TOKENS;

  const stmtsFactory = {
    [RESERVEDS.for]: forStmt,
    [RESERVEDS.system]: ioStmt,
    [RESERVEDS.while]: whileStmt,
    [TOKENS.LITERALS.identifier]: attrbuteStmtVariant,
    [RESERVEDS.if]: ifStmt,
    [TOKENS.SYMBOLS.left_brace]: blockStmt,
    [RESERVEDS.int]: declarationStmt,
    [RESERVEDS.float]: declarationStmt,
    [RESERVEDS.string]: declarationStmt,
    [RESERVEDS.return]: returnStmt,
  };

  const goToStmt = stmtsFactory[token.type];
  if (goToStmt) return goToStmt(iterator);

  const ignoreStmts = {
    [RESERVEDS.break]: iterator.consume.bind(iterator),
    [RESERVEDS.continue]: iterator.consume.bind(iterator),
    [TOKENS.SYMBOLS.semicolon]: iterator.consume.bind(iterator),
  };

  const ignoreStmt = ignoreStmts[token.type];
  if (ignoreStmt) {
    ignoreStmt(token.type);
    return;
  }

  throw new Error(`Unexpected statement: ${token.lexeme}`);
}

function attrbuteStmtVariant(iterator: TokenIterator): void {
  // Consumir o identificador
  const identifier = iterator.consume(TOKENS.LITERALS.identifier);

  // Verificar se é chamada de função (seguido por '(') ou atribuição (seguido por '=')
  if (iterator.peek().type === TOKENS.SYMBOLS.left_paren) {
    // É uma chamada de função
    functionCallExpr(iterator, identifier.lexeme);
    iterator.consume(TOKENS.SYMBOLS.semicolon);
  } else {
    // É uma atribuição - precisa processar o '=' e o resto
    iterator.consume(TOKENS.ASSIGNMENTS.equal, "=");
    const { exprStmt } = require("./exprStmt");
    const value = exprStmt(iterator);
    iterator.consume(TOKENS.SYMBOLS.semicolon);

    // Emitir atribuição
    iterator.emitter.emit("=", identifier.lexeme, value, null);
  }
}
