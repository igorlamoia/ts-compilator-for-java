import fs from "fs";
import { functionCall } from "./grammar/syntax/function-call";
import { Lexer } from "./lexer";
import { TokenIterator } from "./token/TokenIterator";
import { demo, interpret } from "./interpreter";
import { loadInstructionsFromTxt } from "./interpreter/scan";

const PATH = "src/resource/input-code.java";
const ENCODE = "utf-8";

const program: string = fs.readFileSync(
  "src/resource/intermediate-code.txt",
  ENCODE
);
// interpret(program);
const obj = loadInstructionsFromTxt(program);
interpret(obj);
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
