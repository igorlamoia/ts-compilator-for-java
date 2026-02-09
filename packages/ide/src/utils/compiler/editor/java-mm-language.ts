import type * as monacoEditor from "monaco-editor";

export const JAVAMM_LANGUAGE_ID = "java--";

/** Keywords fixas de I/O (sempre presentes no highlighting) */
const IO_KEYWORDS = ["system", "out", "print", "in", "scan"];

/**
 * Registra a linguagem Java-- no Monaco com um Monarch tokenizer.
 * As keywords customizáveis são recebidas como parâmetro para permitir atualização dinâmica.
 */
export function registerJavaMMLanguage(
    monaco: typeof monacoEditor,
    customKeywords: string[]
) {
    // Registrar a linguagem apenas uma vez
    const languages = monaco.languages.getLanguages();
    if (!languages.some((lang) => lang.id === JAVAMM_LANGUAGE_ID)) {
        monaco.languages.register({ id: JAVAMM_LANGUAGE_ID });
    }

    // Todas as keywords para highlighting (custom + I/O)
    const allKeywords = [...customKeywords, ...IO_KEYWORDS];

    // Tipos da linguagem (int, float, string, void)
    const typeKeywords = customKeywords.filter((kw) =>
        ["int", "float", "string", "void"].some(
            (_orig, i) => customKeywords.indexOf(kw) === i
        )
    );

    // (Re)definir o tokenizer Monarch
    monaco.languages.setMonarchTokensProvider(JAVAMM_LANGUAGE_ID, {
        keywords: allKeywords,
        typeKeywords: [],

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
                // Identificadores e keywords
                [
                    /[a-zA-Z_]\w*/,
                    {
                        cases: {
                            "@keywords": "keyword",
                            "@default": "identifier",
                        },
                    },
                ],

                // Whitespace
                { include: "@whitespace" },

                // Delimitadores e operadores
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

                // Números
                [/\d*\.\d+([eE][\-+]?\d+)?/, "number.float"],
                [/0[xX][0-9a-fA-F]+/, "number.hex"],
                [/\d+/, "number"],

                // Delimitadores
                [/[;,.]/, "delimiter"],

                // Strings
                [/"([^"\\]|\\.)*$/, "string.invalid"], // string não terminada
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
    } as monacoEditor.languages.IMonarchLanguage);

    // Configuração de linguagem (brackets, comentários, auto-close)
    monaco.languages.setLanguageConfiguration(JAVAMM_LANGUAGE_ID, {
        comments: {
            lineComment: "//",
            blockComment: ["/*", "*/"],
        },
        brackets: [
            ["{", "}"],
            ["[", "]"],
            ["(", ")"],
        ],
        autoClosingPairs: [
            { open: "{", close: "}" },
            { open: "[", close: "]" },
            { open: "(", close: ")" },
            { open: '"', close: '"' },
        ],
        surroundingPairs: [
            { open: "{", close: "}" },
            { open: "[", close: "]" },
            { open: "(", close: ")" },
            { open: '"', close: '"' },
        ],
    });
}

/**
 * Atualiza apenas o tokenizer (keywords) sem re-registrar a linguagem inteira.
 * Chamado quando o usuário altera as keywords customizadas.
 */
export function updateJavaMMKeywords(
    monaco: typeof monacoEditor,
    customKeywords: string[]
) {
    registerJavaMMLanguage(monaco, customKeywords);
}
