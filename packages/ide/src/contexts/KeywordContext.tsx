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
};

/** Lista ordenada das palavras originais customizáveis (para exibir no modal) */
export const ORIGINAL_KEYWORDS = Object.keys(CUSTOMIZABLE_KEYWORDS);

export type KeywordMapping = {
  original: string;
  custom: string;
  tokenId: number;
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

const STORAGE_KEY = "keyword-mappings";
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

function loadMappings(): KeywordMapping[] {
  if (typeof window === "undefined") return getDefaultMappings();
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return getDefaultMappings();
    const parsed = JSON.parse(stored) as KeywordMapping[];
    // Validar que contém todas as keywords esperadas
    if (
      parsed.length !== ORIGINAL_KEYWORDS.length ||
      !ORIGINAL_KEYWORDS.every((kw) => parsed.some((m) => m.original === kw))
    ) {
      return getDefaultMappings();
    }
    return parsed;
  } catch {
    return getDefaultMappings();
  }
}

function persistMappings(mappings: KeywordMapping[]) {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(mappings));
}

export function KeywordProvider({ children }: { children: ReactNode }) {
  const [mappings, setMappings] =
    useState<KeywordMapping[]>(getDefaultMappings);
  const [isHydrated, setIsHydrated] = useState(false);
  const { monacoRef, retokenize } = useEditor();

  // Carregar do localStorage após montar no client
  useEffect(() => {
    const loadedMappings = loadMappings();
    setMappings(loadedMappings);
    persistMappings(loadedMappings);
    setIsHydrated(true);
  }, []);

  // Persistir no localStorage quando mudar
  useEffect(() => {
    if (!isHydrated) return;
    persistMappings(mappings);
  }, [mappings, isHydrated]);

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
  }, []);

  const buildKeywordMap = useCallback((): Record<string, number> => {
    const map: Record<string, number> = {};
    for (const m of mappings) {
      map[m.custom] = m.tokenId;
    }
    return map;
  }, [mappings]);

  return (
    <KeywordContext.Provider
      value={{
        mappings,
        updateKeyword,
        replaceKeywords,
        resetKeywords,
        buildKeywordMap,
        validateKeyword,
      }}
    >
      {children}
    </KeywordContext.Provider>
  );
}
