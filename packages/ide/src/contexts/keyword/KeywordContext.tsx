import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
  useCallback,
} from "react";
import { useEditor } from "@/hooks/useEditor";
import { updateJavaMMKeywords } from "@/utils/compiler/editor/editor-language";
import { normalizeLanguageDocumentationMap } from "@/lib/compiler-config";
import { buildLexerConfigFromCustomization } from "@/lib/keyword-customization";
import type {
  IDEBooleanLiteralMap,
  IDECompilerConfigPayload,
  IDEKeywordCustomizationModes,
  IDELanguageDocumentationMap,
  IDEOperatorWordMap,
} from "@/entities/compiler-config";
import {
  DEFAULT_BOOLEAN_LITERAL_MAP,
  DEFAULT_OPERATOR_WORD_MAP,
  sanitizeBooleanLiteralMap,
  sanitizeOperatorWordMap,
} from "@/lib/keyword-map";
import {
  validateCustomKeyword,
  validateBlockDelimiters,
} from "./keyword-validator";
import { CUSTOMIZABLE_KEYWORDS, ORIGINAL_KEYWORDS } from ".";
import {
  KeywordContextType,
  KeywordMapping,
  BlockDelimiters,
  StoredKeywordCustomization,
} from "./types";

const KeywordContext = createContext<KeywordContextType>(
  {} as KeywordContextType,
);

export function useKeywords() {
  return useContext(KeywordContext);
}

const STORAGE_KEY = "keyword-customization";
const LEGACY_MAPPINGS_STORAGE_KEY = "keyword-mappings";

export function getDefaultBooleanLiteralMap(): IDEBooleanLiteralMap {
  return { ...DEFAULT_BOOLEAN_LITERAL_MAP };
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
    const storedMapping = parsed.find(
      (mapping) => mapping.original === original,
    );
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

function getDefaultLanguageDocumentationMap(): IDELanguageDocumentationMap {
  return {};
}

function getDefaultModes(): IDEKeywordCustomizationModes {
  return {
    semicolon: "optional-eol",
    block: "delimited",
    typing: "typed",
    array: "fixed",
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
    languageDocumentation: getDefaultLanguageDocumentationMap(),
  };
}

type LegacyCustomizationPayload = Partial<StoredKeywordCustomization> & {
  semicolonMode?: IDEKeywordCustomizationModes["semicolon"];
  blockMode?: IDEKeywordCustomizationModes["block"];
  typingMode?: IDEKeywordCustomizationModes["typing"];
  arrayMode?: IDEKeywordCustomizationModes["array"];
  ui?: unknown;
};

function normalizeModes(
  parsed: LegacyCustomizationPayload,
  defaults: StoredKeywordCustomization,
): IDEKeywordCustomizationModes {
  return {
    semicolon:
      parsed.modes?.semicolon ??
      parsed.semicolonMode ??
      defaults.modes.semicolon,
    block: parsed.modes?.block ?? parsed.blockMode ?? defaults.modes.block,
    typing: parsed.modes?.typing ?? parsed.typingMode ?? defaults.modes.typing,
    array: parsed.modes?.array ?? parsed.arrayMode ?? defaults.modes.array,
  };
}

function normalizeCustomization(
  parsed: LegacyCustomizationPayload,
  defaults: StoredKeywordCustomization,
): StoredKeywordCustomization | null {
  const mappings = Array.isArray(parsed.mappings) ? parsed.mappings : [];
  const migratedMappings = migrateStoredMappings(mappings);

  if (!migratedMappings) return null;

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
    modes: normalizeModes(parsed, defaults),
    languageDocumentation: normalizeLanguageDocumentationMap(
      parsed.languageDocumentation,
    ),
  };
}

function loadLegacyKeywordMappings(): KeywordMapping[] | null {
  if (typeof window === "undefined") return null;

  try {
    const stored = localStorage.getItem(LEGACY_MAPPINGS_STORAGE_KEY);
    if (!stored) return null;

    const parsed = JSON.parse(stored) as unknown;
    if (!Array.isArray(parsed)) return null;

    return migrateStoredMappings(parsed as KeywordMapping[]);
  } catch {
    return null;
  }
}

function loadCustomization(): StoredKeywordCustomization {
  const defaults = getDefaultCustomizationState();
  if (typeof window === "undefined") return defaults;

  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored) as LegacyCustomizationPayload;
      const normalized = normalizeCustomization(parsed, defaults);
      if (normalized) return normalized;
    }

    const legacyMappings = loadLegacyKeywordMappings();
    if (legacyMappings) {
      return {
        ...defaults,
        mappings: legacyMappings,
      };
    }

    return defaults;
  } catch {
    return defaults;
  }
}

function persistCustomization(customization: StoredKeywordCustomization) {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(customization));
}

function resolveNextValue<T>(value: T | ((current: T) => T), current: T): T {
  return typeof value === "function"
    ? (value as (current: T) => T)(current)
    : value;
}

export function KeywordProvider({ children }: { children: ReactNode }) {
  const [customization, setCustomizationState] =
    useState<StoredKeywordCustomization>(getDefaultCustomizationState);
  const [isHydrated, setIsHydrated] = useState(false);
  const editor = useEditor();
  const monacoRef = editor?.monacoRef;
  const retokenize = editor?.retokenize;

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

  // Atualizar syntax highlighting do Monaco
  const updateMonacoHighlighting = useCallback(
    (config?: StoredKeywordCustomization) => {
      const configToUse = config ?? customization;
      if (monacoRef?.current) {
        updateJavaMMKeywords(monacoRef.current, configToUse.mappings, {
          blockMode: configToUse.modes.block,
          blockDelimiters: configToUse.blockDelimiters,
          operatorWordMap: configToUse.operatorWordMap,
          booleanLiteralMap: configToUse.booleanLiteralMap,
          statementTerminatorLexeme: configToUse.statementTerminatorLexeme,
          typingMode: configToUse.modes.typing,
          arrayMode: configToUse.modes.array,
        });
        retokenize?.();
      }
    },
    [monacoRef, retokenize, customization],
  );

  // Atualizar Monaco quando a página é carregada
  useEffect(() => {
    if (isHydrated) updateMonacoHighlighting();
  }, [isHydrated, updateMonacoHighlighting]);

  const validateKeyword = (
    original: string,
    custom: string,
    mappingsToValidate: KeywordMapping[] = customization.mappings,
  ): string | null => {
    return validateCustomKeyword(
      original,
      custom,
      mappingsToValidate,
      customization.booleanLiteralMap,
    );
  };

  const setCustomization = (
    value:
      | StoredKeywordCustomization
      | ((current: StoredKeywordCustomization) => StoredKeywordCustomization),
  ) => {
    setCustomizationState((current) => resolveNextValue(value, current));
  };

  const setModes = (
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
  };

  const setMappings = (
    value: KeywordMapping[] | ((current: KeywordMapping[]) => KeywordMapping[]),
  ) => {
    setCustomizationState((current) => ({
      ...current,
      mappings: resolveNextValue(value, current.mappings),
    }));
  };

  const updateKeyword = (original: string, custom: string) => {
    setMappings((prev: KeywordMapping[]) =>
      prev.map((m: KeywordMapping) =>
        m.original === original ? { ...m, custom } : m,
      ),
    );
  };

  const resetCustomization = () => {
    setCustomizationState(getDefaultCustomizationState());
  };

  const buildKeywordMap = (): Record<string, number> => {
    const map: Record<string, number> = {};
    for (const m of customization.mappings) {
      map[m.custom] = m.tokenId;
    }
    return map;
  };

  const buildLexerConfig = (): IDECompilerConfigPayload => {
    return buildLexerConfigFromCustomization(customization);
  };

  return (
    <KeywordContext.Provider
      value={{
        customization,
        setCustomization,
        setModes,
        setMappings,
        updateKeyword,
        resetCustomization,
        buildKeywordMap,
        validateKeyword,
        validateBlockDelimiters,
        buildLexerConfig,
      }}
    >
      {children}
    </KeywordContext.Provider>
  );
}
