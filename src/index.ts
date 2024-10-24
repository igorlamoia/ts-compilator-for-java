import { Lexer } from "./lexer";

const PATH = "src/resource/input-code.java";
const ENCODE = "utf-8";

const sourceCode: string = require("fs").readFileSync(PATH, ENCODE);

const lexer = new Lexer(sourceCode);
const tokens = lexer.scanTokens();

let tokensArray = [];
for (const token of tokens) {
  tokensArray.push(token.toObject());
  console.log(token.toString());
}
console.table(tokensArray);
