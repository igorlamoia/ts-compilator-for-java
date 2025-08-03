import fs from "fs";
import { functionCall } from "./grammar/syntax/function-call";
import { Lexer } from "./lexer";
import { TokenIterator } from "./token/TokenIterator";
import { Interpreter } from "./interpreter";
import { loadInstructionsFromString } from "./interpreter/scan";
import { demo } from "./interpreter/demo";
import promptSync from "prompt-sync";

const PATH = "src/resource/input-code.java";
const ENCODE = "utf-8";

const program: string = fs.readFileSync(
  "src/resource/intermediate-code.txt",
  ENCODE
);
// interpret(program);
const instructions = loadInstructionsFromString(program);
const prompt = promptSync();
const io = {
  stdout: (msg: string) => process.stdout.write(msg),
  stdin: async () => prompt(""),
};
new Interpreter(instructions, io).execute();
// demo();
// demo();

function lexemerCode() {
  const sourceCode: string = fs.readFileSync(PATH, ENCODE);
  const lexer = new Lexer(sourceCode);
  const tokens = lexer.scanTokens();

  const tree = functionCall(new TokenIterator(tokens));

  let tokensArray = [];
  for (const token of tokens) {
    tokensArray.push(token.toObject());
    console.log(token.toString());
  }
  console.table(tokensArray);
}
