import { describe, expect, it } from "vitest";
import {
  getDefaultBooleanLiteralMap,
  getDefaultKeywordMappings,
  migrateStoredMappings,
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
