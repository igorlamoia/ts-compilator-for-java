import { functionCall } from "grammar/parsers/function-call";
import { Lexer } from "./lexer";
import fs from "fs";
import { TokenIterator } from "token/TokenIterator";

const PATH = "src/resource/input-code.java";
const ENCODE = "utf-8";

const sourceCode: string = fs.readFileSync(PATH, ENCODE);

const lexer = new Lexer(sourceCode);
const tokens = lexer.scanTokens();

// const tree = functionCall(new TokenIterator(tokens));

let tokensArray = [];
for (const token of tokens) {
  tokensArray.push(token.toObject());
  console.log(token.toString());
}
console.table(tokensArray);
