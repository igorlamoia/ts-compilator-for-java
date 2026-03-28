import { z } from "zod";
import type {
  IDEBooleanLiteralMap,
  IDEKeywordCustomizationModes,
  IDEKeywordCustomizationUI,
  IDEOperatorWordMap,
} from "@/entities/compiler-config";
import { DEFAULT_BOOLEAN_LITERAL_MAP } from "@/lib/keyword-map";
import type { KeywordMapping, BlockDelimiters } from "./KeywordContext";
import { ORIGINAL_KEYWORDS } from ".";
export { validateOperatorWordMap as validateOperatorWordMapImpl } from "@/lib/operator-word-map";

type StatementTerminatorValidationCustomization = {
  mappings: KeywordMapping[];
  operatorWordMap: IDEOperatorWordMap;
  booleanLiteralMap: IDEBooleanLiteralMap;
  statementTerminatorLexeme: string;
  blockDelimiters: BlockDelimiters;
  modes: IDEKeywordCustomizationModes;
  ui: IDEKeywordCustomizationUI;
};

export const WORD_REGEX = /^[A-Za-z_][A-Za-z0-9_]*$/;

export const RESERVED_STATEMENT_TERMINATOR_CHARS = new Set([
  ";",
  ",",
  "{",
  "}",
  "(",
  ")",
  "[",
  "]",
  ".",
  ":",
  "+",
  "-",
  "*",
  "/",
  "%",
  "=",
  ">",
  "<",
  "!",
  "|",
  "&",
]);

export function createKeywordSchema(
  mappingsToValidate: KeywordMapping[],
  booleanLiteralMap: IDEBooleanLiteralMap,
) {
  return z
    .object({
      original: z.string(),
      custom: z
        .string()
        .trim()
        .min(1, "A palavra não pode ser vazia.")
        .regex(
          /^[a-zA-Z_][a-zA-Z0-9_]*$/,
          "Use apenas letras, números e underscore (começando com letra ou underscore).",
        ),
    })
    .superRefine((value, ctx) => {
      const booleanLiteralWords = new Set(
        Object.values(booleanLiteralMap)
          .map((item) => item?.trim())
          .filter((item): item is string => Boolean(item)),
      );

      if (booleanLiteralWords.has(value.custom)) {
        ctx.addIssue({
          code: "custom",
          message: `"${value.custom}" já está sendo usada como literal booleano.`,
        });
        return;
      }

      const conflict = mappingsToValidate.find(
        (m) => m.original !== value.original && m.custom === value.custom,
      );
      if (conflict) {
        ctx.addIssue({
          code: "custom",
          message: `"${value.custom}" já está sendo usada para "${conflict.original}".`,
        });
      }
    });
}

export function validateCustomKeyword(
  original: string,
  custom: string,
  mappingsToValidate: KeywordMapping[],
  booleanLiteralMap: IDEBooleanLiteralMap = DEFAULT_BOOLEAN_LITERAL_MAP,
): string | null {
  const parsed = createKeywordSchema(
    mappingsToValidate,
    booleanLiteralMap,
  ).safeParse({
    original,
    custom,
  });
  if (!parsed.success) {
    return parsed.error.issues[0]?.message ?? "Valor inválido.";
  }

  return null;
}

export function validateBlockDelimiters(value: BlockDelimiters): string | null {
  const open = value.open.trim();
  const close = value.close.trim();

  if (!open && !close) return null;
  if (!open || !close) {
    return "Preencha os delimitadores de abertura e fechamento.";
  }

  if (!WORD_REGEX.test(open) || !WORD_REGEX.test(close)) {
    return "Use palavras válidas (letras, números e _, sem espaços).";
  }

  if (open === close) {
    return "Os delimitadores de abertura e fechamento devem ser diferentes.";
  }

  if (ORIGINAL_KEYWORDS.includes(open) || ORIGINAL_KEYWORDS.includes(close)) {
    return "Delimitadores não podem reutilizar palavras reservadas.";
  }

  return null;
}

export function validateBooleanLiteralAliases(
  value: IDEBooleanLiteralMap,
  mappings: KeywordMapping[],
  operatorWordMap: IDEOperatorWordMap,
  blockDelimiters: BlockDelimiters,
): string | null {
  const seenAliases = new Set<string>();
  const keywordSet = new Set(
    mappings.map((mapping) => mapping.custom.trim()).filter(Boolean),
  );
  const operatorAliases = new Set(
    Object.values(operatorWordMap)
      .map((alias) => alias?.trim())
      .filter((alias): alias is string => Boolean(alias)),
  );
  const openDelimiter = blockDelimiters.open.trim();
  const closeDelimiter = blockDelimiters.close.trim();

  for (const field of ["true", "false"] as const) {
    const rawAlias = value[field];
    const alias = typeof rawAlias === "string" ? rawAlias.trim() : "";

    if (!alias) {
      return "Preencha os literais true e false.";
    }

    if (!WORD_REGEX.test(alias)) {
      return "Use palavras válidas para literais booleanos (letras, números e _).";
    }

    if (seenAliases.has(alias)) {
      return "Os literais booleanos precisam ser diferentes.";
    }
    seenAliases.add(alias);

    if (keywordSet.has(alias)) {
      return `"${alias}" conflicts with an existing keyword customization.`;
    }

    if (operatorAliases.has(alias)) {
      return `"${alias}" conflicts with an existing operator alias.`;
    }

    if (alias === openDelimiter || alias === closeDelimiter) {
      return `"${alias}" conflicts with the configured block delimiters.`;
    }
  }

  return null;
}

export function validateStatementTerminatorLexemeImpl(
  value: string,
  customization: StatementTerminatorValidationCustomization,
): string | null {
  const mappingsToValidate = customization.mappings;
  const operatorWordMapToValidate = customization.operatorWordMap;
  const booleanLiteralMapToValidate = customization.booleanLiteralMap;
  const delimitersToValidate = customization.blockDelimiters;
  const normalized = value.trim();

  if (!normalized) {
    return "Informe um terminador.";
  }

  if (/\s/.test(normalized)) {
    return "O terminador não pode conter espaços.";
  }

  if (normalized === ";") {
    return "Escolha um terminador diferente de ;.";
  }

  if (
    [...normalized].some((char) =>
      RESERVED_STATEMENT_TERMINATOR_CHARS.has(char),
    )
  ) {
    return "O terminador não pode reutilizar símbolos ou operadores fixos da linguagem.";
  }

  const keywordSet = new Set(
    [
      ...ORIGINAL_KEYWORDS,
      ...Object.values(DEFAULT_BOOLEAN_LITERAL_MAP),
      ...mappingsToValidate.map((mapping) => mapping.custom.trim()),
    ].filter(Boolean),
  );
  const operatorAliases = new Set(
    Object.values(operatorWordMapToValidate)
      .map((alias) => alias?.trim())
      .filter((alias): alias is string => Boolean(alias)),
  );
  const booleanAliases = new Set(
    Object.values({
      ...DEFAULT_BOOLEAN_LITERAL_MAP,
      ...booleanLiteralMapToValidate,
    })
      .map((alias) => alias?.trim())
      .filter((alias): alias is string => Boolean(alias)),
  );
  const openDelimiter = delimitersToValidate.open.trim();
  const closeDelimiter = delimitersToValidate.close.trim();

  if (keywordSet.has(normalized)) {
    return `"${normalized}" conflicts with an existing keyword customization.`;
  }

  if (operatorAliases.has(normalized)) {
    return `"${normalized}" conflicts with an existing operator alias.`;
  }

  if (booleanAliases.has(normalized)) {
    return `"${normalized}" conflicts with an existing boolean literal alias.`;
  }

  if (normalized === openDelimiter || normalized === closeDelimiter) {
    return `"${normalized}" conflicts with the configured block delimiters.`;
  }

  return null;
}
