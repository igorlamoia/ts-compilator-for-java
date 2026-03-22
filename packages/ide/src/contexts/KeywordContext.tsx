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
  IDEBlockMode,
  IDECompilerConfigPayload,
  IDEOperatorWordMap,
  IDESemicolonMode,
  IDETypingMode,
} from "@/entities/compiler-config";
import { DEFAULT_OPERATOR_WORD_MAP, sanitizeOperatorWordMap } from "@/lib/keyword-map";
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
  variavel: 53,
  funcao: 54,
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
const RESERVED_LITERAL_WORDS = new Set(["true", "false"]);

function createKeywordSchema(mappingsToValidate: KeywordMapping[]) {
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
      if (RESERVED_LITERAL_WORDS.has(value.custom)) {
        ctx.addIssue({
          code: "custom",
          message: `"${value.custom}" é reservado como literal da linguagem.`,
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
): string | null {
  const parsed = createKeywordSchema(mappingsToValidate).safeParse({
    original,
    custom,
  });
  if (!parsed.success) {
    return parsed.error.issues[0]?.message ?? "Valor inválido.";
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

function normalizeArrayMode(
  typingMode: IDETypingMode,
  arrayMode: IDEArrayMode,
): IDEArrayMode {
  return typingMode === "untyped" ? "dynamic" : arrayMode;
}

function loadCustomization(): StoredKeywordCustomization {
  const defaults: StoredKeywordCustomization = {
    mappings: getDefaultKeywordMappings(),
    operatorWordMap: getDefaultOperatorWordMap(),
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
        blockDelimiters:
          delimiters &&
          typeof delimiters.open === "string" &&
          typeof delimiters.close === "string"
            ? delimiters
            : getDefaultBlockDelimiters(),
        semicolonMode,
        blockMode,
        typingMode,
        arrayMode: normalizeArrayMode(typingMode, rawArrayMode),
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
      blockDelimiters,
      semicolonMode,
      blockMode,
      typingMode,
      arrayMode,
    });
  }, [
    mappings,
    operatorWordMap,
    blockDelimiters,
    semicolonMode,
    blockMode,
    typingMode,
    arrayMode,
    isHydrated,
  ]);

  useEffect(() => {
    if (typingMode === "untyped" && arrayMode !== "dynamic") {
      setArrayMode("dynamic");
    }
  }, [typingMode, arrayMode]);

  // Atualizar syntax highlighting do Monaco quando as keywords mudarem
  useEffect(() => {
    if (monacoRef.current) {
      updateJavaMMKeywords(monacoRef.current, mappings, {
        blockMode,
        blockDelimiters,
        operatorWordMap,
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
      return validateCustomKeyword(original, custom, mappingsToValidate);
    },
    [mappings],
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
      ),
    [mappings, blockDelimiters],
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
      arrayMode: normalizeArrayMode(typingMode, arrayMode),
    };

    return {
      keywordMap,
      operatorWordMap,
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
