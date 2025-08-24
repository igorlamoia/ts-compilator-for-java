import fs from "fs";
import { functionCall } from "./grammar/syntax/function-call";
import { Lexer } from "./lexer";
import { TokenIterator } from "./token/TokenIterator";
import { Emitter } from "./ir/emitter";
import { Interpreter } from "./interpreter";
import PromptSync from "prompt-sync";

const sourceCode: string = fs.readFileSync(
  "src/resource/input-code.java",
  "utf-8"
);

function executeCode() {
  const lexer = new Lexer(sourceCode);
  const tokens = lexer.scanTokens();
  const iterator = new TokenIterator(tokens);
  const emitter = new Emitter();
  const tree = functionCall(iterator, emitter);
  const prompt = PromptSync();
  const ioTerminal = {
    stdout: (msg: string) => process.stdout.write(msg),
    // stdout: (msg: string) => console.log(msg),
    stdin: async () => prompt(""),
  };
  const instructions = emitter.getInstructions();
  new Interpreter(instructions, ioTerminal).execute();
}

executeCode();
