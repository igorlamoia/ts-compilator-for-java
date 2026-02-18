export const SUPPORTED_LOCALES = [
  { code: "pt-BR", flag: "🇧🇷" },
  { code: "pt-PT", flag: "🇵🇹" },
  { code: "es", flag: "🇪🇸" },
  { code: "en", flag: "🇺🇸" },
] as const;

export type SupportedLocale = (typeof SUPPORTED_LOCALES)[number]["code"];

const SUPPORTED_LOCALE_CODES = SUPPORTED_LOCALES.map(
  (locale) => locale.code,
) as readonly SupportedLocale[];

type TranslationParams = Record<
  string,
  string | number | boolean | null | undefined | unknown
>;
type TranslationNamespace = Record<string, string>;
type TranslationTree = Record<string, TranslationNamespace>;

// Import locale files
import enLexer from "./locales/en/lexer";
import enParser from "./locales/en/parser";
import enIterator from "./locales/en/iterator";
import enGrammar from "./locales/en/grammar";
import enInterpreter from "./locales/en/interpreter";

import esLexer from "./locales/es/lexer";
import esParser from "./locales/es/parser";
import esIterator from "./locales/es/iterator";
import esGrammar from "./locales/es/grammar";
import esInterpreter from "./locales/es/interpreter";

import ptBrLexer from "./locales/pt-BR/lexer";
import ptBrParser from "./locales/pt-BR/parser";
import ptBrIterator from "./locales/pt-BR/iterator";
import ptBrGrammar from "./locales/pt-BR/grammar";
import ptBrInterpreter from "./locales/pt-BR/interpreter";

import ptPtLexer from "./locales/pt-PT/lexer";
import ptPtParser from "./locales/pt-PT/parser";
import ptPtIterator from "./locales/pt-PT/iterator";
import ptPtGrammar from "./locales/pt-PT/grammar";
import ptPtInterpreter from "./locales/pt-PT/interpreter";

const LOCALES: Record<SupportedLocale, TranslationTree> = {
  "pt-BR": {
    lexer: ptBrLexer,
    parser: ptBrParser,
    iterator: ptBrIterator,
    grammar: ptBrGrammar,
    interpreter: ptBrInterpreter,
  },
  "pt-PT": {
    lexer: ptPtLexer,
    parser: ptPtParser,
    iterator: ptPtIterator,
    grammar: ptPtGrammar,
    interpreter: ptPtInterpreter,
  },
  es: {
    lexer: esLexer,
    parser: esParser,
    iterator: esIterator,
    grammar: esGrammar,
    interpreter: esInterpreter,
  },
  en: {
    lexer: enLexer,
    parser: enParser,
    iterator: enIterator,
    grammar: enGrammar,
    interpreter: enInterpreter,
  },
};

export function resolveLocale(locale: string | undefined): SupportedLocale {
  if (!locale) return "pt-BR";
  if ((SUPPORTED_LOCALE_CODES as readonly string[]).includes(locale)) {
    return locale as SupportedLocale;
  }

  const language = locale.toLowerCase();
  if (language.startsWith("pt")) return "pt-BR";
  if (language.startsWith("es")) return "es";
  if (language.startsWith("en")) return "en";
  return "pt-BR";
}

function resolveFromTree(tree: TranslationTree, key: string): string | null {
  const [namespace, ...parts] = key.split(".");
  if (!namespace || parts.length === 0) return null;

  const messageKey = parts.join(".");
  return tree[namespace]?.[messageKey] ?? null;
}

export function t(
  locale: string | undefined,
  key: string,
  params?: TranslationParams | null,
): string {
  const selected = LOCALES[resolveLocale(locale)];
  const fallback = LOCALES["pt-BR"];
  const template =
    resolveFromTree(selected, key) ?? resolveFromTree(fallback, key) ?? key;

  if (!params) return template;
  return template.replace(/\{(\w+)\}/g, (_, param: string) => {
    const value = params[param];
    return value === undefined || value === null ? `{${param}}` : String(value);
  });
}

// Export t as translate for convenience
export const translate = t;
