import { Lexer } from "./lexer";

const sourceCode = `
int x = 10;
float y = 20.5;
string s = "Olá, Mundo!";
if (x > y) {
    print("x é maior que y");
}
`;

const lexer = new Lexer(sourceCode);
const tokens = lexer.scanTokens();

let tokensArray = [];
for (const token of tokens) {
  tokensArray.push(token.toObject());
  console.log(token.toString());
}
console.table(tokensArray);
