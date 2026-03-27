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
  semicolonMode: IDESemicolonMode;
  blockMode: IDEBlockMode;
  typingMode: IDETypingMode;
  arrayMode: IDEArrayMode;
};

type KeywordContextType = {
  /** Mapeamentos atuais (original → custom) */
  mappings: KeywordMapping[];
  /** Atualiza a palavra customizada de uma keyword original */
  updateKeyword: (original: string, custom: string) => void;
  /** Substitui todos os mapeamentos de uma vez */
  replaceKeywords: (nextMappings: KeywordMapping[]) => void;
  /** Restaura todos os mapeamentos para os valores padrão */
  resetKeywords: () => void;
  /** Retorna o keywordMap final (custom word → token ID) para enviar ao Lexer */
  buildKeywordMap: () => Record<string, number>;
  /** Delimitadores de bloco customizados (open/close) */
  blockDelimiters: BlockDelimiters;
  /** Aliases textuais de operadores */
  operatorWordMap: IDEOperatorWordMap;
  /** Atualiza os aliases textuais de operadores */
  setOperatorWordMap: (value: IDEOperatorWordMap) => void;
  /** Valida aliases textuais de operadores */
  validateOperatorWordMap: (
    value: IDEOperatorWordMap,
    mappingsToValidate?: KeywordMapping[],
    delimitersToValidate?: BlockDelimiters,
  ) => string | null;
  /** Literais booleanos customizados */
  booleanLiteralMap: IDEBooleanLiteralMap;
  /** Atualiza os literais booleanos customizados */
  setBooleanLiteralMap: (value: IDEBooleanLiteralMap) => void;
  /** Terminador de instrução customizado */
  statementTerminatorLexeme: string;
  /** Atualiza o terminador de instrução customizado */
  setStatementTerminatorLexeme: (value: string) => void;
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
  /** Atualiza delimitadores customizados de bloco */
  setBlockDelimiters: (value: BlockDelimiters) => void;
  /** Valida delimitadores customizados de bloco */
  validateBlockDelimiters: (value: BlockDelimiters) => string | null;
  /** Retorna payload completo de customização para APIs do lexer */
  buildLexerConfig: () => IDECompilerConfigPayload;
  /** Modo de ponto e vírgula da gramática */
  semicolonMode: IDESemicolonMode;
  /** Define modo de ponto e vírgula da gramática */
  setSemicolonMode: (value: IDESemicolonMode) => void;
  /** Modo de bloco da gramática */
  blockMode: IDEBlockMode;
  /** Define modo de bloco da gramática */
  setBlockMode: (value: IDEBlockMode) => void;
  /** Modo de tipagem da gramática */
  typingMode: IDETypingMode;
  /** Define modo de tipagem da gramática */
  setTypingMode: (value: IDETypingMode) => void;
  /** Modo de vetores e matrizes da gramática */
  arrayMode: IDEArrayMode;
  /** Define modo de vetores e matrizes da gramática */
  setArrayMode: (value: IDEArrayMode) => void;
  /** Valida se uma palavra customizada é válida */
  validateKeyword: (
    original: string,
    custom: string,
    mappingsToValidate?: KeywordMapping[],
  ) => string | null;
  /** Controla se o modal de customização de keywords está aberto */
  isOpenKeywordCustomizer: boolean;
  /** Define se o modal de customização de keywords está aberto */
  setIsOpenKeywordCustomizer: (value: boolean) => void;
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
          /^[a-zA-Z]+$/,
          "Use apenas letras (sem números, espaços ou símbolos).",
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

function loadCustomization(): StoredKeywordCustomization {
  const defaults: StoredKeywordCustomization = {
    mappings: getDefaultKeywordMappings(),
    operatorWordMap: getDefaultOperatorWordMap(),
    booleanLiteralMap: getDefaultBooleanLiteralMap(),
    statementTerminatorLexeme: getDefaultStatementTerminatorLexeme(),
    blockDelimiters: getDefaultBlockDelimiters(),
    semicolonMode: getDefaultSemicolonMode(),
    blockMode: getDefaultBlockMode(),
    typingMode: getDefaultTypingMode(),
    arrayMode: getDefaultArrayMode(),
  };

  if (typeof window === "undefined") return defaults;

  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored) as Partial<StoredKeywordCustomization>;
      const mappings = Array.isArray(parsed.mappings) ? parsed.mappings : [];
      const delimiters = parsed.blockDelimiters;
      const semicolonMode =
        parsed.semicolonMode === "required" ||
        parsed.semicolonMode === "optional-eol"
          ? parsed.semicolonMode
          : getDefaultSemicolonMode();
      const blockMode =
        parsed.blockMode === "delimited" || parsed.blockMode === "indentation"
          ? parsed.blockMode
          : getDefaultBlockMode();
      const typingMode =
        parsed.typingMode === "typed" || parsed.typingMode === "untyped"
          ? parsed.typingMode
          : getDefaultTypingMode();
      const rawArrayMode =
        parsed.arrayMode === "fixed" || parsed.arrayMode === "dynamic"
          ? parsed.arrayMode
          : getDefaultArrayMode();
      const migratedMappings = migrateStoredMappings(mappings);

      if (!migratedMappings) return defaults;

      return {
        mappings: migratedMappings,
        operatorWordMap: sanitizeOperatorWordMap(parsed.operatorWordMap),
        booleanLiteralMap: sanitizeBooleanLiteralMap(parsed.booleanLiteralMap),
        statementTerminatorLexeme:
          typeof parsed.statementTerminatorLexeme === "string"
            ? parsed.statementTerminatorLexeme.trim()
            : getDefaultStatementTerminatorLexeme(),
        blockDelimiters:
          delimiters &&
          typeof delimiters.open === "string" &&
          typeof delimiters.close === "string"
            ? delimiters
            : getDefaultBlockDelimiters(),
        semicolonMode,
        blockMode,
        typingMode,
        arrayMode: rawArrayMode,
      };
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
      semicolonMode: getDefaultSemicolonMode(),
      blockMode: getDefaultBlockMode(),
      typingMode: getDefaultTypingMode(),
      arrayMode: getDefaultArrayMode(),
    };
  } catch {
    return defaults;
  }
}

function persistCustomization(customization: StoredKeywordCustomization) {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(customization));
}

export function KeywordProvider({ children }: { children: ReactNode }) {
  const [mappings, setMappings] = useState<KeywordMapping[]>(
    getDefaultKeywordMappings,
  );
  const [blockDelimiters, setBlockDelimiters] = useState<BlockDelimiters>(
    getDefaultBlockDelimiters(),
  );
  const [operatorWordMap, setOperatorWordMap] = useState<IDEOperatorWordMap>(
    getDefaultOperatorWordMap(),
  );
  const [booleanLiteralMap, setBooleanLiteralMap] =
    useState<IDEBooleanLiteralMap>(getDefaultBooleanLiteralMap());
  const [statementTerminatorLexeme, setStatementTerminatorLexeme] =
    useState<string>(getDefaultStatementTerminatorLexeme());
  const [semicolonMode, setSemicolonMode] = useState<IDESemicolonMode>(
    getDefaultSemicolonMode(),
  );
  const [blockMode, setBlockMode] = useState<IDEBlockMode>(getDefaultBlockMode);
  const [typingMode, setTypingMode] = useState<IDETypingMode>(
    getDefaultTypingMode(),
  );
  const [arrayMode, setArrayMode] = useState<IDEArrayMode>(getDefaultArrayMode);
  const [isHydrated, setIsHydrated] = useState(false);
  const { monacoRef, retokenize } = useEditor();

  const [isOpenKeywordCustomizer, setIsOpenKeywordCustomizer] = useState(false);

  // Carregar do localStorage após montar no client
  useEffect(() => {
    const loadedCustomization = loadCustomization();
    setMappings(loadedCustomization.mappings);
    setOperatorWordMap(loadedCustomization.operatorWordMap);
    setBooleanLiteralMap(loadedCustomization.booleanLiteralMap);
    setStatementTerminatorLexeme(loadedCustomization.statementTerminatorLexeme);
    setBlockDelimiters(loadedCustomization.blockDelimiters);
    setSemicolonMode(loadedCustomization.semicolonMode);
    setBlockMode(loadedCustomization.blockMode);
    setTypingMode(loadedCustomization.typingMode);
    setArrayMode(loadedCustomization.arrayMode);
    persistCustomization(loadedCustomization);
    setIsHydrated(true);
  }, []);

  // Persistir no localStorage quando mudar
  useEffect(() => {
    if (!isHydrated) return;
    persistCustomization({
      mappings,
      operatorWordMap,
      booleanLiteralMap,
      statementTerminatorLexeme,
      blockDelimiters,
      semicolonMode,
      blockMode,
      typingMode,
      arrayMode,
    });
  }, [
    mappings,
    operatorWordMap,
    booleanLiteralMap,
    statementTerminatorLexeme,
    blockDelimiters,
    semicolonMode,
    blockMode,
    typingMode,
    arrayMode,
    isHydrated,
  ]);

  // Atualizar syntax highlighting do Monaco quando as keywords mudarem
  useEffect(() => {
    if (monacoRef.current) {
      updateJavaMMKeywords(monacoRef.current, mappings, {
        blockMode,
        blockDelimiters,
        operatorWordMap,
        booleanLiteralMap,
        statementTerminatorLexeme,
        typingMode,
        arrayMode,
      });
      retokenize();
    }
  }, [
    mappings,
    blockMode,
    blockDelimiters,
    operatorWordMap,
    booleanLiteralMap,
    statementTerminatorLexeme,
    typingMode,
    arrayMode,
    monacoRef,
    retokenize,
  ]);

  const validateKeyword = useCallback(
    (
      original: string,
      custom: string,
      mappingsToValidate: KeywordMapping[] = mappings,
    ): string | null => {
      return validateCustomKeyword(
        original,
        custom,
        mappingsToValidate,
        booleanLiteralMap,
      );
    },
    [mappings, booleanLiteralMap],
  );

  const updateKeyword = useCallback((original: string, custom: string) => {
    setMappings((prev: KeywordMapping[]) =>
      prev.map((m: KeywordMapping) =>
        m.original === original ? { ...m, custom } : m,
      ),
    );
  }, []);

  const replaceKeywords = useCallback((nextMappings: KeywordMapping[]) => {
    setMappings(nextMappings);
  }, []);

  const resetKeywords = useCallback(() => {
    setMappings(getDefaultKeywordMappings());
    setOperatorWordMap(getDefaultOperatorWordMap());
    setBooleanLiteralMap(getDefaultBooleanLiteralMap());
    setStatementTerminatorLexeme(getDefaultStatementTerminatorLexeme());
    setBlockDelimiters(getDefaultBlockDelimiters());
    setSemicolonMode(getDefaultSemicolonMode());
    setBlockMode(getDefaultBlockMode());
    setTypingMode(getDefaultTypingMode());
    setArrayMode(getDefaultArrayMode());
  }, []);

  const buildKeywordMap = useCallback((): Record<string, number> => {
    const map: Record<string, number> = {};
    for (const m of mappings) {
      map[m.custom] = m.tokenId;
    }
    return map;
  }, [mappings]);

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
      mappingsToValidate: KeywordMapping[] = mappings,
      operatorWordMapToValidate: IDEOperatorWordMap = operatorWordMap,
      delimitersToValidate: BlockDelimiters = blockDelimiters,
    ): string | null =>
      validateBooleanLiteralAliases(
        value,
        mappingsToValidate,
        operatorWordMapToValidate,
        delimitersToValidate,
      ),
    [mappings, operatorWordMap, blockDelimiters],
  );

  const validateOperatorWordMap = useCallback(
    (
      value: IDEOperatorWordMap,
      mappingsToValidate: KeywordMapping[] = mappings,
      delimitersToValidate: BlockDelimiters = blockDelimiters,
    ): string | null =>
      validateOperatorWordMapValue(
        value,
        mappingsToValidate,
        delimitersToValidate,
        booleanLiteralMap,
      ),
    [mappings, blockDelimiters, booleanLiteralMap],
  );

  const buildLexerConfig = useCallback((): IDECompilerConfigPayload => {
    const keywordMap = buildKeywordMap();
    const open = blockDelimiters.open.trim();
    const close = blockDelimiters.close.trim();
    const isBlockDelimiterValid = !validateBlockDelimiters({ open, close });
    const grammar = {
      semicolonMode,
      blockMode,
      typingMode,
      arrayMode,
    };

    return {
      keywordMap,
      operatorWordMap,
      booleanLiteralMap,
      ...(statementTerminatorLexeme.trim()
        ? { statementTerminatorLexeme: statementTerminatorLexeme.trim() }
        : {}),
      grammar,
      indentationBlock: blockMode === "indentation",
      ...(blockMode === "delimited" && open && close && isBlockDelimiterValid
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
    operatorWordMap,
    booleanLiteralMap,
    statementTerminatorLexeme,
    blockDelimiters,
    validateBlockDelimiters,
    semicolonMode,
    blockMode,
    typingMode,
    arrayMode,
  ]);

  return (
    <KeywordContext.Provider
      value={{
        mappings,
        updateKeyword,
        replaceKeywords,
        resetKeywords,
        buildKeywordMap,
        blockDelimiters,
        operatorWordMap,
        booleanLiteralMap,
        statementTerminatorLexeme,
        setStatementTerminatorLexeme,
        validateStatementTerminatorLexeme,
        setBooleanLiteralMap,
        validateBooleanLiteralMap,
        setOperatorWordMap,
        validateOperatorWordMap,
        setBlockDelimiters,
        validateBlockDelimiters,
        buildLexerConfig,
        semicolonMode,
        setSemicolonMode,
        blockMode,
        setBlockMode,
        typingMode,
        setTypingMode,
        arrayMode,
        setArrayMode,
        validateKeyword,
        isOpenKeywordCustomizer,
        setIsOpenKeywordCustomizer,
      }}
    >
      {children}
    </KeywordContext.Provider>
  );
}
