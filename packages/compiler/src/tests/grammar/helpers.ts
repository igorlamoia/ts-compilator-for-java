import { functionCall } from "../../grammar/syntax/function-call";
import { Lexer } from "../../lexer";
import { Instruction } from "../../interpreter/constants";
import { TokenIterator } from "../../token/TokenIterator";

export function compileToIr(source: string): Instruction[] {
  const lexer = new Lexer(source, { locale: "en" });
  const tokens = lexer.scanTokens();
  const iterator = new TokenIterator(tokens, "en");

  while (iterator.hasNext()) {
    functionCall(iterator);
  }

  return iterator.emitter.getInstructions();
}
