import { describe, expect, it } from "vitest";
import { Lexer } from "../lexer";
import { Token } from "../token";

describe("Lexer", () => {
  it("should scan tokens ignoring comments", () => {
    // Arrange
    const source = `int x = 0;
/* lorem ipsum dolor sit amet, consectetur adipiscing elit. */
float pi = 3.14;
/* lorem
ipsum */int y = 45;/*lorem ipsum dolor sit amet, consectetur adipiscing elit.
string s = /*Igor says "Olá,\\n Mundo!";
if (x > y) {
    // another comment
    system.out.print("x é maior que y");
}*/float var = 2;`;
    const expected = [
      new Token(21, "int", 1, 1),
      new Token(43, "x", 1, 5),
      new Token(15, "=", 1, 7),
      new Token(48, "0", 1, 9),
      new Token(36, ";", 1, 10),
      new Token(22, "float", 3, 1),
      new Token(43, "pi", 3, 7),
      new Token(15, "=", 3, 10),
      new Token(46, "3.14", 3, 12),
      new Token(36, ";", 3, 16),
      new Token(21, "int", 5, 9),
      new Token(43, "y", 5, 13),
      new Token(15, "=", 5, 15),
      new Token(45, "45", 5, 17),
      new Token(36, ";", 5, 19),
      new Token(22, "float", 10, 4),
      new Token(43, "var", 10, 10),
      new Token(15, "=", 10, 14),
      new Token(45, "2", 10, 16),
      new Token(36, ";", 10, 17),
      new Token(99, "", 10, 18),
    ];
    // Act
    const lexer = new Lexer(source);
    const tokens = lexer.scanTokens();
    // Assert
    expect(tokens).toEqual(expected);
  });
});
