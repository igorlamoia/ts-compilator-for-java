import type * as monacoEditor from "monaco-editor";

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
};

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

    operators: [
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
    ],

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
  const brackets: monacoEditor.languages.LanguageBracket[] = [
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
  types: new Set(["int", "float", "string", "void"]),
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

/**
 * Snippet bodies keyed by the original keyword.
 * Uses Monaco snippet syntax: $1, $2 for tab stops, ${1:placeholder} for placeholders.
 */
const KEYWORD_SNIPPETS: Record<string, { body: string; description: string }> =
  {
    int: { body: "int ${1:nome};", description: "Declarar int" },
    float: { body: "float ${1:nome};", description: "Declarar float" },
    string: { body: "string ${1:nome};", description: "Declarar string" },
    void: {
      body: "void ${1:funcao}(${2:params}) {\n\t$3\n}",
      description: "Função void",
    },
    if: {
      body: "if (${1:condicao}) {\n\t$2\n}",
      description: "Bloco if",
    },
    else: { body: "else {\n\t$1\n}", description: "Bloco else" },
    switch: {
      body: "switch (${1:variavel}) {\n\tcase ${2:valor}:\n\t\t$3\n\t\tbreak;\n\tdefault:\n\t\t$4\n}",
      description: "Bloco switch",
    },
    for: {
      body: "for (${1:int i = 0}; ${2:i < n}; ${3:++i}) {\n\t$4\n}",
      description: "Laço for",
    },
    while: {
      body: "while (${1:condicao}) {\n\t$2\n}",
      description: "Laço while",
    },
    return: { body: "return ${1:valor};", description: "Retornar valor" },
    break: { body: "break;", description: "Interromper laço" },
    continue: { body: "continue;", description: "Continuar laço" },
    print: {
      body: 'print(${1:"mensagem"});',
      description: "Imprimir valor",
    },
    scan: {
      body: "scan(${1:int}, ${2:variavel});",
      description: "Ler entrada",
    },
  };

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
  completionProviderDisposable =
    monaco.languages.registerCompletionItemProvider(JAVAMM_LANGUAGE_ID, {
      provideCompletionItems(model, position) {
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

          // Snippet completion (if a template is defined for this original keyword)
          const snippet = KEYWORD_SNIPPETS[mapping.original];
          if (snippet) {
            // Replace the original keyword in the snippet body with the custom one
            const customBody = snippet.body.replace(
              new RegExp(`^${mapping.original}\\b`),
              keyword,
            );
            suggestions.push({
              label: `${keyword}…`,
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
