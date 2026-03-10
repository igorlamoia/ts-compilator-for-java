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
  IDEBlockMode,
  IDECompilerConfigPayload,
  IDESemicolonMode,
  IDETypingMode,
} from "@/entities/compiler-config";

/** As 13 keywords editáveis com seus IDs numéricos de token */
const CUSTOMIZABLE_KEYWORDS: Record<string, number> = {
  int: 21,
  float: 22,
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
  blockDelimiters: BlockDelimiters;
  semicolonMode: IDESemicolonMode;
  blockMode: IDEBlockMode;
  typingMode: IDETypingMode;
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

function getDefaultMappings(): KeywordMapping[] {
  return ORIGINAL_KEYWORDS.map((word) => ({
    original: word,
    custom: word,
    tokenId: CUSTOMIZABLE_KEYWORDS[word],
  }));
}

function isValidStoredMappings(parsed: KeywordMapping[]): boolean {
  return (
    parsed.length === ORIGINAL_KEYWORDS.length &&
    ORIGINAL_KEYWORDS.every((kw) => parsed.some((m) => m.original === kw))
  );
}

function getDefaultBlockDelimiters(): BlockDelimiters {
  return {
    open: "",
    close: "",
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

function loadCustomization(): StoredKeywordCustomization {
  const defaults: StoredKeywordCustomization = {
    mappings: getDefaultMappings(),
    blockDelimiters: getDefaultBlockDelimiters(),
    semicolonMode: getDefaultSemicolonMode(),
    blockMode: getDefaultBlockMode(),
    typingMode: getDefaultTypingMode(),
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

      if (!isValidStoredMappings(mappings)) return defaults;

      return {
        mappings,
        blockDelimiters:
          delimiters &&
          typeof delimiters.open === "string" &&
          typeof delimiters.close === "string"
            ? delimiters
            : getDefaultBlockDelimiters(),
        semicolonMode,
        blockMode,
        typingMode,
      };
    }

    const legacyStored = localStorage.getItem(LEGACY_STORAGE_KEY);
    if (!legacyStored) return defaults;

    const parsedLegacy = JSON.parse(legacyStored) as KeywordMapping[];
    if (!isValidStoredMappings(parsedLegacy)) return defaults;

    return {
      mappings: parsedLegacy,
      blockDelimiters: getDefaultBlockDelimiters(),
      semicolonMode: getDefaultSemicolonMode(),
      blockMode: getDefaultBlockMode(),
      typingMode: getDefaultTypingMode(),
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
  const [mappings, setMappings] =
    useState<KeywordMapping[]>(getDefaultMappings);
  const [blockDelimiters, setBlockDelimiters] = useState<BlockDelimiters>(
    getDefaultBlockDelimiters(),
  );
  const [semicolonMode, setSemicolonMode] = useState<IDESemicolonMode>(
    getDefaultSemicolonMode(),
  );
  const [blockMode, setBlockMode] = useState<IDEBlockMode>(getDefaultBlockMode);
  const [typingMode, setTypingMode] = useState<IDETypingMode>(
    getDefaultTypingMode(),
  );
  const [isHydrated, setIsHydrated] = useState(false);
  const { monacoRef, retokenize } = useEditor();

  const [isOpenKeywordCustomizer, setIsOpenKeywordCustomizer] = useState(false);

  // Carregar do localStorage após montar no client
  useEffect(() => {
    const loadedCustomization = loadCustomization();
    setMappings(loadedCustomization.mappings);
    setBlockDelimiters(loadedCustomization.blockDelimiters);
    setSemicolonMode(loadedCustomization.semicolonMode);
    setBlockMode(loadedCustomization.blockMode);
    setTypingMode(loadedCustomization.typingMode);
    persistCustomization(loadedCustomization);
    setIsHydrated(true);
  }, []);

  // Persistir no localStorage quando mudar
  useEffect(() => {
    if (!isHydrated) return;
    persistCustomization({
      mappings,
      blockDelimiters,
      semicolonMode,
      blockMode,
      typingMode,
    });
  }, [
    mappings,
    blockDelimiters,
    semicolonMode,
    blockMode,
    typingMode,
    isHydrated,
  ]);

  // Atualizar syntax highlighting do Monaco quando as keywords mudarem
  useEffect(() => {
    if (monacoRef.current) {
      const customWords = mappings
        .map((m: KeywordMapping) => m.custom)
        .filter(Boolean);
      updateJavaMMKeywords(monacoRef.current, customWords);
      retokenize();
    }
  }, [mappings, monacoRef, retokenize]);

  const validateKeyword = useCallback(
    (
      original: string,
      custom: string,
      mappingsToValidate: KeywordMapping[] = mappings,
    ): string | null => {
      const parsed = createKeywordSchema(mappingsToValidate).safeParse({
        original,
        custom,
      });
      if (!parsed.success) {
        return parsed.error.issues[0]?.message ?? "Valor inválido.";
      }

      return null; // válido
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
    setMappings(getDefaultMappings());
    setBlockDelimiters(getDefaultBlockDelimiters());
    setSemicolonMode(getDefaultSemicolonMode());
    setBlockMode(getDefaultBlockMode());
    setTypingMode(getDefaultTypingMode());
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

  const buildLexerConfig = useCallback((): IDECompilerConfigPayload => {
    const keywordMap = buildKeywordMap();
    const open = blockDelimiters.open.trim();
    const close = blockDelimiters.close.trim();
    const isBlockDelimiterValid = !validateBlockDelimiters({ open, close });
    const grammar = {
      semicolonMode,
      blockMode,
      typingMode,
    };

    return {
      keywordMap,
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
    blockDelimiters,
    validateBlockDelimiters,
    semicolonMode,
    blockMode,
    typingMode,
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
        setBlockDelimiters,
        validateBlockDelimiters,
        buildLexerConfig,
        semicolonMode,
        setSemicolonMode,
        blockMode,
        setBlockMode,
        typingMode,
        setTypingMode,
        validateKeyword,
        isOpenKeywordCustomizer,
        setIsOpenKeywordCustomizer,
      }}
    >
      {children}
    </KeywordContext.Provider>
  );
}
