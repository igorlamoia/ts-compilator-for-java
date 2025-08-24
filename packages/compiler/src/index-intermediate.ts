import fs from "fs";
import { functionCall } from "./grammar/syntax/function-call";
import { Lexer } from "./lexer";
import { TokenIterator } from "./token/TokenIterator";
import { Interpreter } from "./interpreter";
import { loadInstructionsFromString } from "./interpreter/scan";
import { demo } from "./interpreter/demo";
import promptSync from "prompt-sync";
import { IntermediateCodeGenerator } from "./intermediator/generator";

const PATH = "src/resource/input-code.java";
const ENCODE = "utf-8";

const program: string = fs.readFileSync(
  "src/resource/intermediate-code.txt",
  ENCODE
);

const prompt = promptSync();
const ioTerminal = {
  // stdout: (msg: string) => process.stdout.write(msg),
  stdout: (msg: string) => console.log(msg),
  stdin: async () => prompt(""),
};

function execute() {
  // runningIntermediate()
  generateIntermediate()
}

execute();


function runningIntermediate() {
  const instructions = loadInstructionsFromString(program);
  new Interpreter(instructions, ioTerminal).execute();
}

function lexemerCode() {
  const sourceCode: string = fs.readFileSync(PATH, ENCODE);
  const lexer = new Lexer(sourceCode);
  const tokens = lexer.scanTokens();

  return tokens;

  const tree = functionCall(new TokenIterator(tokens));

  let tokensArray = [];
  for (const token of tokens) {
    tokensArray.push(token.toObject());
    console.log(token.toString());
  }
  console.table(tokensArray);

}


function generateIntermediate() {
  const tokens = lexemerCode();
  // console.log(tokens);
  const generator = new IntermediateCodeGenerator(tokens);
  const program = generator.generate();
  console.log(program);
  const interpreter = new Interpreter(program, ioTerminal);
  interpreter.execute();

}