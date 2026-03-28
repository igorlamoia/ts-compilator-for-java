import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
  useCallback,
} from "react";
import { z } from "zod";
import { useEditor } from "@/hooks/useEditor";
import { updateJavaMMKeywords } from "@/utils/compiler/editor/editor-language";
import type {
  IDEArrayMode,
  IDEBooleanLiteralMap,
  IDEBlockMode,
  IDECompilerConfigPayload,
  IDEKeywordCustomizationModes,
  IDEKeywordCustomizationUI,
  IDEOperatorWordMap,
  IDESemicolonMode,
  IDETypingMode,
} from "@/entities/compiler-config";
import {
  DEFAULT_BOOLEAN_LITERAL_MAP,
  DEFAULT_OPERATOR_WORD_MAP,
  sanitizeBooleanLiteralMap,
  sanitizeOperatorWordMap,
} from "@/lib/keyword-map";
import { validateOperatorWordMap as validateOperatorWordMapValue } from "@/lib/operator-word-map";

/** As 13 keywords editáveis com seus IDs numéricos de token */
const CUSTOMIZABLE_KEYWORDS: Record<string, number> = {
  int: 21,
  float: 22,
  bool: 55,
  string: 23,
  void: 49,
  for: 24,
  while: 25,
  break: 26,
  continue: 27,
  if: 28,
  else: 29,
  return: 30,
  print: 33,
  scan: 35,
  switch: 50,
  case: 51,
  default: 52,
  variavel: 62,
  funcao: 63,
};

/** Lista ordenada das palavras originais customizáveis (para exibir no modal) */
export const ORIGINAL_KEYWORDS = Object.keys(CUSTOMIZABLE_KEYWORDS);

export type KeywordMapping = {
  original: string;
  custom: string;
  tokenId: number;
};

export type BlockDelimiters = {
  open: string;
  close: string;
};

type StoredKeywordCustomization = {
  mappings: KeywordMapping[];
  operatorWordMap: IDEOperatorWordMap;
  booleanLiteralMap: IDEBooleanLiteralMap;
  statementTerminatorLexeme: string;
  blockDelimiters: BlockDelimiters;
  modes: IDEKeywordCustomizationModes;
  ui: IDEKeywordCustomizationUI;
};

type LegacyStoredKeywordCustomization = Partial<StoredKeywordCustomization> & {
  semicolonMode?: IDESemicolonMode;
  blockMode?: IDEBlockMode;
  typingMode?: IDETypingMode;
  arrayMode?: IDEArrayMode;
  ui?: Partial<IDEKeywordCustomizationUI>;
  modes?: Partial<IDEKeywordCustomizationModes>;
};

type KeywordContextType = {
  customization: StoredKeywordCustomization;
  setCustomization: (
    value:
      | StoredKeywordCustomization
      | ((current: StoredKeywordCustomization) => StoredKeywordCustomization),
  ) => void;
  setModes: (
    value:
      | IDEKeywordCustomizationModes
      | ((
          current: IDEKeywordCustomizationModes,
        ) => IDEKeywordCustomizationModes),
  ) => void;
  setUi: (
    value:
      | IDEKeywordCustomizationUI
      | ((current: IDEKeywordCustomizationUI) => IDEKeywordCustomizationUI),
  ) => void;
  setMappings: (
    value:
      | KeywordMapping[]
      | ((current: KeywordMapping[]) => KeywordMapping[]),
  ) => void;
  updateKeyword: (original: string, custom: string) => void;
  resetCustomization: () => void;
  /** Retorna o keywordMap final (custom word → token ID) para enviar ao Lexer */
  buildKeywordMap: () => Record<string, number>;
  /** Valida aliases textuais de operadores */
  validateOperatorWordMap: (
    value: IDEOperatorWordMap,
    mappingsToValidate?: KeywordMapping[],
    delimitersToValidate?: BlockDelimiters,
  ) => string | null;
  /** Valida o terminador de instrução customizado */
  validateStatementTerminatorLexeme: (
    value: string,
    mappingsToValidate?: KeywordMapping[],
    operatorWordMapToValidate?: IDEOperatorWordMap,
    booleanLiteralMapToValidate?: IDEBooleanLiteralMap,
    delimitersToValidate?: BlockDelimiters,
  ) => string | null;
  /** Valida literais booleanos customizados */
  validateBooleanLiteralMap: (
    value: IDEBooleanLiteralMap,
    mappingsToValidate?: KeywordMapping[],
    operatorWordMapToValidate?: IDEOperatorWordMap,
    delimitersToValidate?: BlockDelimiters,
  ) => string | null;
  /** Valida delimitadores customizados de bloco */
  validateBlockDelimiters: (value: BlockDelimiters) => string | null;
  /** Retorna payload completo de customização para APIs do lexer */
  buildLexerConfig: () => IDECompilerConfigPayload;
  /** Valida se uma palavra customizada é válida */
  validateKeyword: (
    original: string,
    custom: string,
    mappingsToValidate?: KeywordMapping[],
  ) => string | null;
};

const KeywordContext = createContext<KeywordContextType>(
  {} as KeywordContextType,
);

export function useKeywords() {
  return useContext(KeywordContext);
}

const LEGACY_STORAGE_KEY = "keyword-mappings";
const STORAGE_KEY = "keyword-customization";
const WORD_REGEX = /^[A-Za-z_][A-Za-z0-9_]*$/;
const RESERVED_STATEMENT_TERMINATOR_CHARS = new Set([
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

function createKeywordSchema(
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

export function getDefaultBooleanLiteralMap(): IDEBooleanLiteralMap {
  return { ...DEFAULT_BOOLEAN_LITERAL_MAP };
}

export function validateStatementTerminatorLexeme(
  value: string,
  mappingsToValidate: KeywordMapping[] = getDefaultKeywordMappings(),
  operatorWordMapToValidate: IDEOperatorWordMap = {},
  booleanLiteralMapToValidate: IDEBooleanLiteralMap = DEFAULT_BOOLEAN_LITERAL_MAP,
  delimitersToValidate: BlockDelimiters = { open: "", close: "" },
): string | null {
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

  if ([...normalized].some((char) => RESERVED_STATEMENT_TERMINATOR_CHARS.has(char))) {
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

export function getDefaultKeywordMappings(): KeywordMapping[] {
  return ORIGINAL_KEYWORDS.map((word) => ({
    original: word,
    custom: word,
    tokenId: CUSTOMIZABLE_KEYWORDS[word],
  }));
}

export function migrateStoredMappings(
  parsed: KeywordMapping[],
): KeywordMapping[] | null {
  const defaultsByOriginal = new Map(
    getDefaultKeywordMappings().map((mapping) => [mapping.original, mapping]),
  );
  const nextMappings: KeywordMapping[] = [];

  for (const original of ORIGINAL_KEYWORDS) {
    const storedMapping = parsed.find((mapping) => mapping.original === original);
    const defaultMapping = defaultsByOriginal.get(original);
    if (!defaultMapping) {
      return null;
    }

    if (!storedMapping) {
      nextMappings.push(defaultMapping);
      continue;
    }

    if (
      typeof storedMapping.custom !== "string" ||
      typeof storedMapping.original !== "string"
    ) {
      return null;
    }

    nextMappings.push({
      original: defaultMapping.original,
      custom: storedMapping.custom,
      tokenId: defaultMapping.tokenId,
    });
  }

  return nextMappings;
}

function getDefaultBlockDelimiters(): BlockDelimiters {
  return {
    open: "",
    close: "",
  };
}

function getDefaultOperatorWordMap(): IDEOperatorWordMap {
  return { ...DEFAULT_OPERATOR_WORD_MAP };
}

function getDefaultStatementTerminatorLexeme(): string {
  return "";
}

function getDefaultModes(): IDEKeywordCustomizationModes {
  return {
    semicolon: "optional-eol",
    block: "delimited",
    typing: "typed",
    array: "fixed",
  };
}

function getDefaultUi(): IDEKeywordCustomizationUI {
  return {
    isKeywordCustomizerOpen: false,
  };
}

export function getDefaultCustomizationState(): StoredKeywordCustomization {
  return {
    mappings: getDefaultKeywordMappings(),
    operatorWordMap: getDefaultOperatorWordMap(),
    booleanLiteralMap: getDefaultBooleanLiteralMap(),
    statementTerminatorLexeme: getDefaultStatementTerminatorLexeme(),
    blockDelimiters: getDefaultBlockDelimiters(),
    modes: getDefaultModes(),
    ui: getDefaultUi(),
  };
}

function getDefaultSemicolonMode(): IDESemicolonMode {
  return "optional-eol";
}

function getDefaultBlockMode(): IDEBlockMode {
  return "delimited";
}

function getDefaultTypingMode(): IDETypingMode {
  return "typed";
}

function getDefaultArrayMode(): IDEArrayMode {
  return "fixed";
}

function normalizeCustomization(
  parsed: LegacyStoredKeywordCustomization,
  defaults: StoredKeywordCustomization,
): StoredKeywordCustomization | null {
  const mappings = Array.isArray(parsed.mappings) ? parsed.mappings : [];
  const migratedMappings = migrateStoredMappings(mappings);

  if (!migratedMappings) return null;

  const legacyModes: Partial<IDEKeywordCustomizationModes> = parsed.modes ?? {};
  const semicolonMode =
    legacyModes.semicolon === "required" ||
    legacyModes.semicolon === "optional-eol"
      ? legacyModes.semicolon
      : parsed.semicolonMode === "required" ||
          parsed.semicolonMode === "optional-eol"
        ? parsed.semicolonMode
        : defaults.modes.semicolon;
  const blockMode =
    legacyModes.block === "delimited" || legacyModes.block === "indentation"
      ? legacyModes.block
      : parsed.blockMode === "delimited" ||
          parsed.blockMode === "indentation"
        ? parsed.blockMode
        : defaults.modes.block;
  const typingMode =
    legacyModes.typing === "typed" || legacyModes.typing === "untyped"
      ? legacyModes.typing
      : parsed.typingMode === "typed" || parsed.typingMode === "untyped"
        ? parsed.typingMode
        : defaults.modes.typing;
  const arrayMode =
    legacyModes.array === "fixed" || legacyModes.array === "dynamic"
      ? legacyModes.array
      : parsed.arrayMode === "fixed" || parsed.arrayMode === "dynamic"
        ? parsed.arrayMode
        : defaults.modes.array;
  const delimiters = parsed.blockDelimiters;

  return {
    mappings: migratedMappings,
    operatorWordMap: sanitizeOperatorWordMap(parsed.operatorWordMap),
    booleanLiteralMap: sanitizeBooleanLiteralMap(parsed.booleanLiteralMap),
    statementTerminatorLexeme:
      typeof parsed.statementTerminatorLexeme === "string"
        ? parsed.statementTerminatorLexeme.trim()
        : defaults.statementTerminatorLexeme,
    blockDelimiters:
      delimiters &&
      typeof delimiters.open === "string" &&
      typeof delimiters.close === "string"
        ? delimiters
        : defaults.blockDelimiters,
    modes: {
      semicolon: semicolonMode,
      block: blockMode,
      typing: typingMode,
      array: arrayMode,
    },
    ui: getDefaultUi(),
  };
}

function loadCustomization(): StoredKeywordCustomization {
  const defaults = getDefaultCustomizationState();
  if (typeof window === "undefined") return defaults;

  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored) as LegacyStoredKeywordCustomization;
      const normalized = normalizeCustomization(parsed, defaults);
      if (normalized) return normalized;
    }

    const legacyStored = localStorage.getItem(LEGACY_STORAGE_KEY);
    if (!legacyStored) return defaults;

    const parsedLegacy = JSON.parse(legacyStored) as KeywordMapping[];
    const migratedLegacyMappings = migrateStoredMappings(parsedLegacy);
    if (!migratedLegacyMappings) return defaults;

    return {
      mappings: migratedLegacyMappings,
      operatorWordMap: getDefaultOperatorWordMap(),
      booleanLiteralMap: getDefaultBooleanLiteralMap(),
      statementTerminatorLexeme: getDefaultStatementTerminatorLexeme(),
      blockDelimiters: getDefaultBlockDelimiters(),
      modes: getDefaultModes(),
      ui: getDefaultUi(),
    };
  } catch {
    return defaults;
  }
}

function persistCustomization(customization: StoredKeywordCustomization) {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(customization));
}

function resolveNextValue<T>(
  value: T | ((current: T) => T),
  current: T,
): T {
  return typeof value === "function"
    ? (value as (current: T) => T)(current)
    : value;
}

export function KeywordProvider({ children }: { children: ReactNode }) {
  const [customization, setCustomizationState] =
    useState<StoredKeywordCustomization>(getDefaultCustomizationState);
  const [isHydrated, setIsHydrated] = useState(false);
  const { monacoRef, retokenize } = useEditor();

  // Carregar do localStorage após montar no client
  useEffect(() => {
    const loadedCustomization = loadCustomization();
    setCustomizationState(loadedCustomization);
    persistCustomization(loadedCustomization);
    setIsHydrated(true);
  }, []);

  // Persistir no localStorage quando mudar
  useEffect(() => {
    if (!isHydrated) return;
    persistCustomization(customization);
  }, [customization, isHydrated]);

  // Atualizar syntax highlighting do Monaco quando as keywords mudarem
  useEffect(() => {
    if (monacoRef.current) {
      updateJavaMMKeywords(monacoRef.current, customization.mappings, {
        blockMode: customization.modes.block,
        blockDelimiters: customization.blockDelimiters,
        operatorWordMap: customization.operatorWordMap,
        booleanLiteralMap: customization.booleanLiteralMap,
        statementTerminatorLexeme: customization.statementTerminatorLexeme,
        typingMode: customization.modes.typing,
        arrayMode: customization.modes.array,
      });
      retokenize();
    }
  }, [
    customization.mappings,
    customization.modes.block,
    customization.blockDelimiters,
    customization.operatorWordMap,
    customization.booleanLiteralMap,
    customization.statementTerminatorLexeme,
    customization.modes.typing,
    customization.modes.array,
    monacoRef,
    retokenize,
  ]);

  const validateKeyword = useCallback(
    (
      original: string,
      custom: string,
      mappingsToValidate: KeywordMapping[] = customization.mappings,
    ): string | null => {
      return validateCustomKeyword(original, custom, mappingsToValidate, customization.booleanLiteralMap);
    },
    [customization.booleanLiteralMap, customization.mappings],
  );

  const setCustomization = useCallback(
    (
      value:
        | StoredKeywordCustomization
        | ((current: StoredKeywordCustomization) => StoredKeywordCustomization),
    ) => {
      setCustomizationState((current) => resolveNextValue(value, current));
    },
    [],
  );

  const setModes = useCallback(
    (
      value:
        | IDEKeywordCustomizationModes
        | ((
            current: IDEKeywordCustomizationModes,
          ) => IDEKeywordCustomizationModes),
    ) => {
      setCustomizationState((current) => ({
        ...current,
        modes: resolveNextValue(value, current.modes),
      }));
    },
    [],
  );

  const setUi = useCallback(
    (
      value:
        | IDEKeywordCustomizationUI
        | ((current: IDEKeywordCustomizationUI) => IDEKeywordCustomizationUI),
    ) => {
      setCustomizationState((current) => ({
        ...current,
        ui: resolveNextValue(value, current.ui),
      }));
    },
    [],
  );

  const setMappings = useCallback(
    (
      value:
        | KeywordMapping[]
        | ((current: KeywordMapping[]) => KeywordMapping[]),
    ) => {
      setCustomizationState((current) => ({
        ...current,
        mappings: resolveNextValue(value, current.mappings),
      }));
    },
    [],
  );

  const updateKeyword = useCallback((original: string, custom: string) => {
    setMappings((prev: KeywordMapping[]) =>
      prev.map((m: KeywordMapping) =>
        m.original === original ? { ...m, custom } : m,
      ),
    );
  }, [setMappings]);

  const resetCustomization = useCallback(() => {
    setCustomizationState(getDefaultCustomizationState());
  }, []);

  const buildKeywordMap = useCallback((): Record<string, number> => {
    const map: Record<string, number> = {};
    for (const m of customization.mappings) {
      map[m.custom] = m.tokenId;
    }
    return map;
  }, [customization.mappings]);

  const validateBlockDelimiters = useCallback(
    (value: BlockDelimiters): string | null => {
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

      if (
        ORIGINAL_KEYWORDS.includes(open) ||
        ORIGINAL_KEYWORDS.includes(close)
      ) {
        return "Delimitadores não podem reutilizar palavras reservadas.";
      }

      return null;
    },
    [],
  );

  const validateBooleanLiteralMap = useCallback(
    (
      value: IDEBooleanLiteralMap,
      mappingsToValidate: KeywordMapping[] = customization.mappings,
      operatorWordMapToValidate: IDEOperatorWordMap = customization.operatorWordMap,
      delimitersToValidate: BlockDelimiters = customization.blockDelimiters,
    ): string | null =>
      validateBooleanLiteralAliases(
        value,
        mappingsToValidate,
        operatorWordMapToValidate,
        delimitersToValidate,
      ),
    [customization.mappings, customization.operatorWordMap, customization.blockDelimiters],
  );

  const validateOperatorWordMap = useCallback(
    (
      value: IDEOperatorWordMap,
      mappingsToValidate: KeywordMapping[] = customization.mappings,
      delimitersToValidate: BlockDelimiters = customization.blockDelimiters,
    ): string | null =>
      validateOperatorWordMapValue(
        value,
        mappingsToValidate,
        delimitersToValidate,
        customization.booleanLiteralMap,
      ),
    [customization.mappings, customization.blockDelimiters, customization.booleanLiteralMap],
  );

  const buildLexerConfig = useCallback((): IDECompilerConfigPayload => {
    const keywordMap = buildKeywordMap();
    const open = customization.blockDelimiters.open.trim();
    const close = customization.blockDelimiters.close.trim();
    const isBlockDelimiterValid = !validateBlockDelimiters({ open, close });
    const grammar = {
      semicolonMode: customization.modes.semicolon,
      blockMode: customization.modes.block,
      typingMode: customization.modes.typing,
      arrayMode: customization.modes.array,
    };

    return {
      keywordMap,
      operatorWordMap: customization.operatorWordMap,
      booleanLiteralMap: customization.booleanLiteralMap,
      ...(customization.statementTerminatorLexeme.trim()
        ? { statementTerminatorLexeme: customization.statementTerminatorLexeme.trim() }
        : {}),
      grammar,
      indentationBlock: customization.modes.block === "indentation",
      ...(customization.modes.block === "delimited" && open && close && isBlockDelimiterValid
        ? {
            blockDelimiters: {
              open,
              close,
            },
          }
        : {}),
    };
  }, [
    buildKeywordMap,
    customization.blockDelimiters,
    customization.operatorWordMap,
    customization.booleanLiteralMap,
    customization.statementTerminatorLexeme,
    customization.modes.semicolon,
    customization.modes.block,
    customization.modes.typing,
    customization.modes.array,
    validateBlockDelimiters,
  ]);

  return (
    <KeywordContext.Provider
      value={{
        customization,
        setCustomization,
        setModes,
        setUi,
        setMappings,
        updateKeyword,
        resetCustomization,
        buildKeywordMap,
        validateKeyword,
        validateStatementTerminatorLexeme,
        validateBooleanLiteralMap,
        validateOperatorWordMap,
        validateBlockDelimiters,
        buildLexerConfig,
      }}
    >
      {children}
    </KeywordContext.Provider>
  );
}
