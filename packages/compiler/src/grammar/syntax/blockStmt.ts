import { TOKENS } from "../../token/constants";
import { TokenIterator } from "../../token/TokenIterator";
import { listStmt } from "./listStmt";
/**
 * Processes a block statement by parsing a list of statements.
 * Handles both brace-delimited and indentation-based blocks.
 *
 * @derivation `<blockStmt> -> '{' <stmtList> '}' | ':' NEWLINE INDENT <stmtList> DEDENT`
 */
export function blockStmt(iterator: TokenIterator): void {
  const blockMode = iterator.getBlockMode();
  const { left_brace, right_brace, colon, newline, indent, dedent } =
    TOKENS.SYMBOLS;

  if (blockMode === "indentation") {
    // Indentation-based block: ':' NEWLINE INDENT <stmtList> DEDENT
    iterator.consume(colon);

    // Consume newline if present
    if (iterator.peek().type === newline) {
      iterator.consume(newline);
    }

    iterator.consume(indent);
    listStmt(iterator);
    iterator.consume(dedent);
  } else {
    // Brace-delimited block: '{' <stmtList> '}'
    iterator.consume(left_brace);
    listStmt(iterator);
    iterator.consume(right_brace);
  }
}
