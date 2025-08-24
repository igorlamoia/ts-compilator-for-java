import fs from "fs";
import { functionCall } from "./grammar/syntax/function-call";
import { Lexer } from "./lexer";
import { TokenIterator } from "./token/TokenIterator";
import { Interpreter } from "./interpreter";
import PromptSync from "prompt-sync";
import { loadInstructionsFromString } from "./interpreter/scan";
import PROGRAM from "./resource/intermediate-code";
import { IntermediateObject } from "./resource/intermediate-object";

const sourceCode: string = fs.readFileSync(
  "src/resource/input-code.java",
  "utf-8"
);

function executeCode() {
  const lexer = new Lexer(sourceCode);
  const tokens = lexer.scanTokens();
  const iterator = new TokenIterator(tokens);
  const instructions = iterator.generateIntermediateCode();
  const prompt = PromptSync();
  const ioTerminal = {
    // stdout: (msg: string) => process.stdout.write(msg),
    stdout: (msg: string) => console.log(msg),
    stdin: async () => prompt(""),
  };
  // const instructions = loadInstructionsFromString(PROGRAM);

  console.log(instructions);
  // const instructions = IntermediateObject;
  // return;
  new Interpreter(instructions, ioTerminal).execute();
}

executeCode();
