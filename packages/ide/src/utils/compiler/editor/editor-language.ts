import type * as monacoEditor from "monaco-editor";
import {
  JavaMMBlockMode,
  JavaMMSnippetVariant,
  JavaMMTypingMode,
} from "./types";
import { KEYWORD_SNIPPETS } from "./keyword-snippets";

export const JAVAMM_LANGUAGE_ID = "java--";

export type JavaMMKeywordMapping = {
  original: string;
  custom: string;
  tokenId: number;
};

type JavaMMSemanticGroupName =
  | "types"
  | "conditionals"
  | "loops"
  | "flow"
  | "io";

export type JavaMMLanguageMetadata = {
  allKeywords: string[];
  semanticGroups: Record<JavaMMSemanticGroupName, string[]>;
};

export type JavaMMBlockDelimiters = {
  open: string;
  close: string;
};

export type JavaMMLanguageOptions = {
  blockMode?: "delimited" | "indentation";
  blockDelimiters?: JavaMMBlockDelimiters;
  typingMode?: "typed" | "untyped";
};

const DEFAULT_OPERATORS = [
  "=",
  ">",
  "<",
  "!",
  "==",
  "<=",
  ">=",
  "!=",
  "&&",
  "||",
  "+",
  "-",
  "*",
  "/",
  "%",
  "+=",
  "-=",
  "*=",
  "/=",
  "%=",
  "++",
  "--",
  "**",
];

export function buildJavaMMMonarchLanguage(
  metadata: JavaMMLanguageMetadata,
): monacoEditor.languages.IMonarchLanguage {
  return {
    keywords: metadata.allKeywords,
    types: metadata.semanticGroups.types,
    conditionals: metadata.semanticGroups.conditionals,
    loops: metadata.semanticGroups.loops,
    flow: metadata.semanticGroups.flow,
    io: metadata.semanticGroups.io,
    operators: DEFAULT_OPERATORS,
    symbols: /[=><!~?:&|+\-*\/\^%]+/,
    tokenizer: {
      root: [
        [
          /[a-zA-Z_]\w*/,
          {
            cases: {
              "@types": "keyword.type",
              "@conditionals": "keyword.conditional",
              "@loops": "keyword.loop",
              "@flow": "keyword.flow",
              "@io": "keyword.io",
              "@keywords": "keyword",
              "@default": "identifier",
            },
          },
        ],
        { include: "@whitespace" },
        [/[{}()\[\]]/, "@brackets"],
        [/[<>](?!@symbols)/, "@brackets"],
        [
          /@symbols/,
          {
            cases: {
              "@operators": "operator",
              "@default": "",
            },
          },
        ],
        [/\d*\.\d+([eE][\-+]?\d+)?/, "number.float"],
        [/0[xX][0-9a-fA-F]+/, "number.hex"],
        [/\d+/, "number"],
        [/[;,.]/, "delimiter"],
        [/"([^"\\]|\\.)*$/, "string.invalid"],
        [/"/, { token: "string.quote", bracket: "@open", next: "@string" }],
      ],

      string: [
        [/[^\\"]+/, "string"],
        [/\\./, "string.escape"],
        [/"/, { token: "string.quote", bracket: "@close", next: "@pop" }],
      ],

      whitespace: [
        [/[ \t\r\n]+/, "white"],
        [/\/\*/, "comment", "@comment"],
        [/\/\/.*$/, "comment"],
      ],

      comment: [
        [/[^\/*]+/, "comment"],
        [/\*\//, "comment", "@pop"],
        [/[\/*]/, "comment"],
      ],
    },
  };
}

export function buildJavaMMLanguageConfiguration(
  options: JavaMMLanguageOptions = {},
): monacoEditor.languages.LanguageConfiguration {
  const brackets: [string, string][] = [
    ["{", "}"],
    ["[", "]"],
    ["(", ")"],
  ];
  const autoClosingPairs: monacoEditor.languages.IAutoClosingPair[] = [
    { open: "{", close: "}" },
    { open: "[", close: "]" },
    { open: "(", close: ")" },
    { open: '"', close: '"' },
  ];
  const surroundingPairs: monacoEditor.languages.IAutoClosingPair[] = [
    { open: "{", close: "}" },
    { open: "[", close: "]" },
    { open: "(", close: ")" },
    { open: '"', close: '"' },
  ];
  const open = options.blockDelimiters?.open.trim();
  const close = options.blockDelimiters?.close.trim();

  if (options.blockMode === "delimited" && open && close) {
    brackets.push([open, close]);
    autoClosingPairs.push({ open, close });
    surroundingPairs.push({ open, close });
  }

  return {
    comments: {
      lineComment: "//",
      blockComment: ["/*", "*/"],
    },
    brackets,
    autoClosingPairs,
    surroundingPairs,
  };
}

const SEMANTIC_KEYWORD_GROUPS: Record<JavaMMSemanticGroupName, Set<string>> = {
  types: new Set(["int", "float", "string", "void", "variavel", "funcao"]),
  conditionals: new Set(["if", "else", "switch", "case", "default"]),
  loops: new Set(["for", "while"]),
  flow: new Set(["break", "continue", "return"]),
  io: new Set(["print", "scan"]),
};

export function buildJavaMMLanguageMetadata(
  keywordMappings: JavaMMKeywordMapping[],
): JavaMMLanguageMetadata {
  const semanticGroups: JavaMMLanguageMetadata["semanticGroups"] = {
    types: [],
    conditionals: [],
    loops: [],
    flow: [],
    io: [],
  };

  for (const mapping of keywordMappings) {
    const customKeyword = mapping.custom.trim();
    if (!customKeyword) continue;

    for (const [groupName, originals] of Object.entries(
      SEMANTIC_KEYWORD_GROUPS,
    ) as [JavaMMSemanticGroupName, Set<string>][]) {
      if (originals.has(mapping.original)) {
        semanticGroups[groupName].push(customKeyword);
      }
    }
  }

  return {
    allKeywords: keywordMappings
      .map((mapping) => mapping.custom.trim())
      .filter(Boolean),
    semanticGroups,
  };
}

const SEMANTIC_GROUP_LABELS: Record<JavaMMSemanticGroupName, string> = {
  types: "Tipo",
  conditionals: "Condicional",
  loops: "Laço de repetição",
  flow: "Controle de fluxo",
  io: "Entrada/Saída",
};

function mapSnippetKeywords(
  snippetBody: string,
  keywordMappings: JavaMMKeywordMapping[],
): string {
  const mappingEntries = keywordMappings
    .map((m) => ({ original: m.original, custom: m.custom.trim() }))
    .filter((m) => Boolean(m.custom));

  if (!mappingEntries.length) return snippetBody;

  return mappingEntries.reduce((acc, item) => {
    const expression = new RegExp(`\\b${item.original}\\b`, "g");
    return acc.replace(expression, item.custom);
  }, snippetBody);
}

function isSnippetSupported(
  snippet: JavaMMSnippetVariant,
  typingMode: JavaMMTypingMode,
  blockMode: JavaMMBlockMode,
): boolean {
  const supportsTyping =
    !snippet.typingMode || snippet.typingMode === typingMode;
  const supportsBlock = !snippet.blockMode || snippet.blockMode === blockMode;
  return supportsTyping && supportsBlock;
}

let completionProviderDisposable: monacoEditor.IDisposable | null = null;

/**
 * Registra a linguagem Java-- no Monaco com um Monarch tokenizer.
 * As keywords customizáveis são recebidas como parâmetro para permitir atualização dinâmica.
 */
export function registerJavaMMLanguage(
  monaco: typeof monacoEditor,
  keywordMappings: JavaMMKeywordMapping[],
  options: JavaMMLanguageOptions = {},
) {
  // Registrar a linguagem apenas uma vez
  const languages = monaco.languages.getLanguages();
  if (!languages.some((lang) => lang.id === JAVAMM_LANGUAGE_ID)) {
    monaco.languages.register({ id: JAVAMM_LANGUAGE_ID });
  }

  const metadata = buildJavaMMLanguageMetadata(keywordMappings);

  // (Re)definir o tokenizer Monarch
  monaco.languages.setMonarchTokensProvider(
    JAVAMM_LANGUAGE_ID,
    buildJavaMMMonarchLanguage(metadata),
  );

  // Configuração de linguagem (brackets, comentários, auto-close)
  monaco.languages.setLanguageConfiguration(
    JAVAMM_LANGUAGE_ID,
    buildJavaMMLanguageConfiguration(options),
  );

  // Dispose previous completion provider before registering a new one
  completionProviderDisposable?.dispose();
  if (typeof monaco.languages.registerCompletionItemProvider !== "function") {
    completionProviderDisposable = null;
    return;
  }
  completionProviderDisposable =
    monaco.languages.registerCompletionItemProvider(JAVAMM_LANGUAGE_ID, {
      provideCompletionItems(model, position) {
        const preferredTypingMode: JavaMMTypingMode =
          options.typingMode ?? "typed";
        const preferredBlockMode: JavaMMBlockMode =
          options.blockMode ?? "delimited";
        const word = model.getWordUntilPosition(position);
        const range = {
          startLineNumber: position.lineNumber,
          endLineNumber: position.lineNumber,
          startColumn: word.startColumn,
          endColumn: word.endColumn,
        };

        const suggestions: monacoEditor.languages.CompletionItem[] = [];

        for (const mapping of keywordMappings) {
          const keyword = mapping.custom.trim();
          if (!keyword) continue;

          let groupLabel = "Palavra-chave";
          for (const [groupName, originals] of Object.entries(
            SEMANTIC_KEYWORD_GROUPS,
          ) as [JavaMMSemanticGroupName, Set<string>][]) {
            if (originals.has(mapping.original)) {
              groupLabel = SEMANTIC_GROUP_LABELS[groupName];
              break;
            }
          }

          // Keyword completion
          suggestions.push({
            label: keyword,
            kind: monaco.languages.CompletionItemKind.Keyword,
            detail: groupLabel,
            insertText: keyword,
            range,
          });

          // Snippet completion (multiple typed/untyped + block-mode variants)
          const snippets = KEYWORD_SNIPPETS[mapping.original] ?? [];
          for (const snippet of snippets) {
            if (
              !isSnippetSupported(
                snippet,
                preferredTypingMode,
                preferredBlockMode,
              )
            ) {
              continue;
            }

            const customBody = mapSnippetKeywords(
              snippet.body,
              keywordMappings,
            );
            const suffix = snippet.labelSuffix
              ? ` (${snippet.labelSuffix})`
              : "";
            suggestions.push({
              label: `${keyword}…${suffix}`,
              kind: monaco.languages.CompletionItemKind.Snippet,
              detail: snippet.description,
              documentation: customBody,
              insertText: customBody,
              insertTextRules:
                monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
              range,
            });
          }
        }

        return { suggestions };
      },
    });
}

/**
 * Atualiza apenas o tokenizer (keywords) sem re-registrar a linguagem inteira.
 * Chamado quando o usuário altera as keywords customizadas.
 */
export function updateJavaMMKeywords(
  monaco: typeof monacoEditor,
  keywordMappings: JavaMMKeywordMapping[],
  options: JavaMMLanguageOptions = {},
) {
  registerJavaMMLanguage(monaco, keywordMappings, options);
}
