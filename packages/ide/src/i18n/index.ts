import enFooter from "./locales/en/footer";
import enGrammar from "./locales/en/grammar";
import enIterator from "./locales/en/iterator";
import enLexer from "./locales/en/lexer";
import enParser from "./locales/en/parser";
import enToast from "./locales/en/toast";
import enToken from "./locales/en/token";
import enUi from "./locales/en/ui";
import esFooter from "./locales/es/footer";
import esGrammar from "./locales/es/grammar";
import esIterator from "./locales/es/iterator";
import esLexer from "./locales/es/lexer";
import esParser from "./locales/es/parser";
import esToast from "./locales/es/toast";
import esToken from "./locales/es/token";
import esUi from "./locales/es/ui";
import ptBrFooter from "./locales/pt-BR/footer";
import ptBrGrammar from "./locales/pt-BR/grammar";
import ptBrIterator from "./locales/pt-BR/iterator";
import ptBrLexer from "./locales/pt-BR/lexer";
import ptBrParser from "./locales/pt-BR/parser";
import ptBrToast from "./locales/pt-BR/toast";
import ptBrToken from "./locales/pt-BR/token";
import ptBrUi from "./locales/pt-BR/ui";
import ptPtFooter from "./locales/pt-PT/footer";
import ptPtGrammar from "./locales/pt-PT/grammar";
import ptPtIterator from "./locales/pt-PT/iterator";
import ptPtLexer from "./locales/pt-PT/lexer";
import ptPtParser from "./locales/pt-PT/parser";
import ptPtToast from "./locales/pt-PT/toast";
import ptPtToken from "./locales/pt-PT/token";
import ptPtUi from "./locales/pt-PT/ui";

export const SUPPORTED_LOCALES = ["pt-BR", "pt-PT", "es", "en"] as const;
export type SupportedLocale = (typeof SUPPORTED_LOCALES)[number];

type TranslationParams = Record<
  string,
  string | number | boolean | null | undefined
>;
type TranslationNamespace = Record<string, string>;
type TranslationTree = Record<string, TranslationNamespace>;

const LOCALES: Record<SupportedLocale, TranslationTree> = {
  "pt-BR": {
    ui: ptBrUi,
    toast: ptBrToast,
    footer: ptBrFooter,
    lexer: ptBrLexer,
    parser: ptBrParser,
    iterator: ptBrIterator,
    grammar: ptBrGrammar,
    token: ptBrToken,
  },
  "pt-PT": {
    ui: ptPtUi,
    toast: ptPtToast,
    footer: ptPtFooter,
    lexer: ptPtLexer,
    parser: ptPtParser,
    iterator: ptPtIterator,
    grammar: ptPtGrammar,
    token: ptPtToken,
  },
  es: {
    ui: esUi,
    toast: esToast,
    footer: esFooter,
    lexer: esLexer,
    parser: esParser,
    iterator: esIterator,
    grammar: esGrammar,
    token: esToken,
  },
  en: {
    ui: enUi,
    toast: enToast,
    footer: enFooter,
    lexer: enLexer,
    parser: enParser,
    iterator: enIterator,
    grammar: enGrammar,
    token: enToken,
  },
};

export function resolveLocale(locale: string | undefined): SupportedLocale {
  if (!locale) return "pt-BR";
  if ((SUPPORTED_LOCALES as readonly string[]).includes(locale)) {
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
  const template = resolveFromTree(selected, key) ?? resolveFromTree(fallback, key) ?? key;

  if (!params) return template;
  return template.replace(/\{(\w+)\}/g, (_, param: string) => {
    const value = params[param];
    return value === undefined || value === null ? `{${param}}` : String(value);
  });
}

export function translateTokenDescription(
  locale: string | undefined,
  tokenName: string,
): string {
  return t(locale, `token.${tokenName}`);
}
