import { describe, expect, it } from "vitest";
import { Lexer } from "../../lexer";
import { Token } from "../../token";

describe("Lexer Number", () => {
  describe("Float Cases", () => {
    it("should recognize float", () => {
      // Arrange
      const source = `float pi = 3.14;`;
      const expected = [
        new Token(22, "float", 1, 1),
        new Token(43, "pi", 1, 7),
        new Token(15, "=", 1, 10),
        new Token(46, "3.14", 1, 12),
        new Token(36, ";", 1, 16),
        // new Token(99, "", 1, 17),
      ];
      // Act
      const lexer = new Lexer(source);
      const tokens = lexer.scanTokens();
      // Assert
      expect(tokens).toEqual(expected);
    });
    it("should put a Zero at the beginning of the number", () => {
      // Arrange
      const source = `float pi = .14;`;
      const expected = [
        new Token(22, "float", 1, 1),
        new Token(43, "pi", 1, 7),
        new Token(15, "=", 1, 10),
        new Token(46, "0.14", 1, 12),
        new Token(36, ";", 1, 15),
        // new Token(99, "", 1, 16),
      ];
      // Act
      const lexer = new Lexer(source);
      const tokens = lexer.scanTokens();
      // Assert
      expect(tokens).toEqual(expected);
    });
    it("should put a Zero at the end of the number", () => {
      // Arrange
      const source = `float pi = 3.;`;
      const expected = [
        new Token(22, "float", 1, 1),
        new Token(43, "pi", 1, 7),
        new Token(15, "=", 1, 10),
        new Token(46, "3.0", 1, 12),
        new Token(36, ";", 1, 14),
        // new Token(99, "", 1, 15),
      ];
      // Act
      const lexer = new Lexer(source);
      const tokens = lexer.scanTokens();
      // Assert
      expect(tokens).toEqual(expected);
    });
    it("should throw an error when there is more than one dot", () => {
      // Arrange
      const source = `float pi = 3.1.4;`;
      // Act
      const lexer = new Lexer(source);
      // Assert
      expect(() => lexer.scanTokens()).toThrow();
    });
    it("should throw an error when finishing with not valid char", () => {
      // Arrange
      const source = `float pi = 3.1b;`;
      // Act
      const lexer = new Lexer(source);
      // Assert
      expect(() => lexer.scanTokens()).toThrow();
    });
    it("shouldn't throw an error when finishing with a space before invalid char", () => {
      // Arrange
      const source = `float pi = 3.1 b;`;
      // Act
      const lexer = new Lexer(source);
      // Assert
      expect(() => lexer.scanTokens()).not.toThrow();
    });
  });
  describe("Integer Cases", () => {
    it("should scan an integer number", () => {
      // Arrange
      const source = `int x = 123;`;
      const expected = [
        new Token(21, "int", 1, 1),
        new Token(43, "x", 1, 5),
        new Token(15, "=", 1, 7),
        new Token(45, "123", 1, 9),
        new Token(36, ";", 1, 12),
        // new Token(99, "", 1, 13),
      ];
      // Act
      const lexer = new Lexer(source);
      const tokens = lexer.scanTokens();
      // Assert
      expect(tokens).toEqual(expected);
    });
    it("should throw an error when finishing with not valid char", () => {
      // Arrange
      const source = `float pi = 3b;`;
      // Act
      const lexer = new Lexer(source);
      // Assert
      expect(() => lexer.scanTokens()).toThrow();
    });
    it("shouldn't throw an error when finishing with a space before invalid char", () => {
      // Arrange
      const source = `float pi = 3 b;`;
      // Act
      const lexer = new Lexer(source);
      // Assert
      expect(() => lexer.scanTokens()).not.toThrow();
    });
  });
  describe("Octal Cases", () => {
    it("should scan an octal number", () => {
      // Arrange
      const source = `int x = 0123;`;
      const expected = [
        new Token(21, "int", 1, 1),
        new Token(43, "x", 1, 5),
        new Token(15, "=", 1, 7),
        new Token(48, "0123", 1, 9),
        new Token(36, ";", 1, 13),
        // new Token(99, "", 1, 14),
      ];
      // Act
      const lexer = new Lexer(source);
      const tokens = lexer.scanTokens();
      // Assert
      expect(tokens).toEqual(expected);
    });
    it("should throw an error when the number is invalid", () => {
      // Arrange
      const source = `int pi = 07778;`;
      // Act
      const lexer = new Lexer(source);
      // Assert
      expect(() => lexer.scanTokens()).toThrow();
    });
  });
  describe("Hex Cases", () => {
    it("should scan a hex number", () => {
      // Arrange
      const source = `int x = 0xFFF;`;
      const expected = [
        new Token(21, "int", 1, 1),
        new Token(43, "x", 1, 5),
        new Token(15, "=", 1, 7),
        new Token(47, "0xFFF", 1, 9),
        new Token(36, ";", 1, 14),
        // new Token(99, "", 1, 15),
      ];
      // Act
      const lexer = new Lexer(source);
      const tokens = lexer.scanTokens();
      // Assert
      expect(tokens).toEqual(expected);
    });
    it("should throw an error when the letters are in lower case", () => {
      // Arrange
      const source = `int pi = 0xfff;`;
      // Act
      const lexer = new Lexer(source);
      // Assert
      expect(() => lexer.scanTokens()).toThrow();
    });
    it("should throw an error when the x is in upper case", () => {
      // Arrange
      const source = `int pi = 0XFFF;`;
      // Act
      const lexer = new Lexer(source);
      // Assert
      expect(() => lexer.scanTokens()).toThrow();
    });
    it("should throw an error when finishing with not valid char", () => {
      // Arrange
      const source = `int pi = 0xFFFx;`;
      // Act
      const lexer = new Lexer(source);
      // Assert
      expect(() => lexer.scanTokens()).toThrow();
    });
    it("shouldn't throw an error when finishing with a space before invalid char", () => {
      // Arrange
      const source = `float pi = 0xFFF x;`;
      // Act
      const lexer = new Lexer(source);
      // Assert
      expect(() => lexer.scanTokens()).not.toThrow();
    });
  });
});
