import { describe, expect, it } from "vitest";
import {
  getDefaultBooleanLiteralMap,
  getDefaultKeywordMappings,
  migrateStoredMappings,
  validateStatementTerminatorLexeme,
  validateBooleanLiteralAliases,
  validateCustomKeyword,
} from "@/contexts/KeywordContext";

describe("migrateStoredMappings", () => {
  it("preserves older saved mappings and appends bool with its default value", () => {
    const legacyMappings = getDefaultKeywordMappings()
      .filter((mapping) => mapping.original !== "bool")
      .map((mapping) =>
        mapping.original === "int"
          ? { ...mapping, custom: "inteiro" }
          : mapping.original === "print"
            ? { ...mapping, custom: "escreva" }
            : mapping,
      );

    const migrated = migrateStoredMappings(legacyMappings);

    expect(migrated).toHaveLength(getDefaultKeywordMappings().length);
    expect(migrated.find((mapping) => mapping.original === "int")?.custom).toBe(
      "inteiro",
    );
    expect(
      migrated.find((mapping) => mapping.original === "print")?.custom,
    ).toBe("escreva");
    expect(
      migrated.find((mapping) => mapping.original === "bool"),
    ).toEqual({
      original: "bool",
      custom: "bool",
      tokenId: 55,
    });
  });
});

describe("validateCustomKeyword", () => {
  it("allows true when boolean literal aliases are customized away from defaults", () => {
    const error = validateCustomKeyword(
      "int",
      "true",
      getDefaultKeywordMappings(),
      { true: "yes", false: "no" },
    );

    expect(error).toBeNull();
  });

  it("rejects conflicts with the active boolean literal aliases", () => {
    const error = validateCustomKeyword(
      "print",
      "yes",
      getDefaultKeywordMappings(),
      { true: "yes", false: "no" },
    );

    expect(error).toBe('"yes" já está sendo usada como literal booleano.');
  });
});

describe("boolean literal customization", () => {
  it("returns true and false as the default boolean literal aliases", () => {
    expect(getDefaultBooleanLiteralMap()).toEqual({
      true: "true",
      false: "false",
    });
  });

  it("rejects duplicate boolean literal aliases", () => {
    const error = validateBooleanLiteralAliases(
      { true: "sim", false: "sim" },
      getDefaultKeywordMappings(),
      {},
      { open: "", close: "" },
    );

    expect(error).toBe("Os literais booleanos precisam ser diferentes.");
  });

  it("rejects boolean literal aliases that conflict with keyword customizations", () => {
    const mappings = getDefaultKeywordMappings().map((mapping) =>
      mapping.original === "int" ? { ...mapping, custom: "inteiro" } : mapping,
    );

    const error = validateBooleanLiteralAliases(
      { true: "inteiro", false: "falso" },
      mappings,
      {},
      { open: "", close: "" },
    );

    expect(error).toBe('"inteiro" conflicts with an existing keyword customization.');
  });
});

describe("statement terminator customization", () => {
  it("accepts non-conflicting symbolic terminators", () => {
    const error = validateStatementTerminatorLexeme("@@");

    expect(error).toBeNull();
  });

  it("rejects whitespace in statement terminators", () => {
    const error = validateStatementTerminatorLexeme("two words");

    expect(error).toBe("O terminador não pode conter espaços.");
  });

  it("rejects semicolon as a custom statement terminator", () => {
    const error = validateStatementTerminatorLexeme(";");

    expect(error).toBe("Escolha um terminador diferente de ;.");
  });

  it("rejects reserved operator characters in statement terminators", () => {
    const error = validateStatementTerminatorLexeme("!!");

    expect(error).toBe(
      "O terminador não pode reutilizar símbolos ou operadores fixos da linguagem.",
    );
  });

  it("rejects terminators that collide with keyword customizations", () => {
    const error = validateStatementTerminatorLexeme(
      "uai",
      [
        { original: "if", custom: "uai", tokenId: 28 },
        { original: "while", custom: "enquanto", tokenId: 25 },
      ],
    );

    expect(error).toBe('"uai" conflicts with an existing keyword customization.');
  });

  it("rejects original reserved keywords even after customization remaps them", () => {
    const error = validateStatementTerminatorLexeme(
      "if",
      [{ original: "if", custom: "se", tokenId: 28 }],
    );

    expect(error).toBe('"if" conflicts with an existing keyword customization.');
  });

  it("rejects terminators that collide with operator aliases", () => {
    const error = validateStatementTerminatorLexeme(
      "uai",
      getDefaultKeywordMappings(),
      { logical_and: "uai" },
    );

    expect(error).toBe('"uai" conflicts with an existing operator alias.');
  });

  it("rejects terminators that collide with boolean aliases", () => {
    const error = validateStatementTerminatorLexeme(
      "uai",
      getDefaultKeywordMappings(),
      {},
      { true: "uai", false: "nao" },
    );

    expect(error).toBe('"uai" conflicts with an existing boolean literal alias.');
  });

  it("rejects default boolean literals even after customization remaps them", () => {
    const error = validateStatementTerminatorLexeme(
      "true",
      getDefaultKeywordMappings(),
      {},
      { true: "sim", false: "nao" },
    );

    expect(error).toBe('"true" conflicts with an existing keyword customization.');
  });

  it("rejects terminators that collide with block delimiters", () => {
    const error = validateStatementTerminatorLexeme(
      "uai",
      getDefaultKeywordMappings(),
      {},
      getDefaultBooleanLiteralMap(),
      { open: "uai", close: "fim" },
    );

    expect(error).toBe('"uai" conflicts with the configured block delimiters.');
  });
});
