import { describe, expect, it } from "vitest";
import {
  getDefaultKeywordMappings,
  migrateStoredMappings,
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
  it("rejects true as a custom keyword", () => {
    const error = validateCustomKeyword(
      "int",
      "true",
      getDefaultKeywordMappings(),
    );

    expect(error).toBe('"true" é reservado como literal da linguagem.');
  });

  it("rejects false as a custom keyword", () => {
    const error = validateCustomKeyword(
      "print",
      "false",
      getDefaultKeywordMappings(),
    );

    expect(error).toBe('"false" é reservado como literal da linguagem.');
  });
});
