import {
  Code2,
  GitCompareArrows,
  Repeat,
  Sigma,
  Terminal,
  ToggleRight,
  Type,
  Workflow,
  type LucideIcon,
} from "lucide-react";

export type PreviewCategory = {
  key:
    | "tipos"
    | "entrada"
    | "condicionais"
    | "lacos"
    | "fluxo"
    | "operadores"
    | "booleanos"
    | "estrutura";
  title: string;
  subtitle: string;
  lexemes: string[];
  icon: LucideIcon;
};

export const PREVIEW_CATEGORIES: PreviewCategory[] = [
  {
    key: "entrada",
    title: "ENTRADA/SAIDA",
    subtitle: "Leitura e exibição de dados.",
    lexemes: ["print", "scan"],
    icon: Terminal,
  },
  {
    key: "tipos",
    title: "TIPOS E DECLARACOES",
    subtitle: "Valores, tipos e definições principais da linguagem.",
    lexemes: ["int", "float", "bool", "string", "void", "variavel", "funcao"],
    icon: Type,
  },
  {
    key: "condicionais",
    title: "CONDICIONAIS",
    subtitle: "Regras de decisão e caminhos alternativos.",
    lexemes: ["if", "else", "switch", "case", "default"],
    icon: GitCompareArrows,
  },
  {
    key: "lacos",
    title: "LACOS",
    subtitle: "Repetições controladas pela lógica do programa.",
    lexemes: ["for", "while"],
    icon: Repeat,
  },
  {
    key: "fluxo",
    title: "FLUXO",
    subtitle: "Saídas antecipadas e controle de execução.",
    lexemes: ["break", "continue", "return"],
    icon: Workflow,
  },

  {
    key: "booleanos",
    title: "BOOLEANOS",
    subtitle: "Representam verdadeiro e falso.",
    lexemes: ["true", "false"],
    icon: ToggleRight,
  },
  {
    key: "estrutura",
    title: "ESTRUTURA",
    subtitle: "Blocos, separadores e terminadores.",
    lexemes: ["{", "}", ";"],
    icon: Code2,
  },
  {
    key: "operadores",
    title: "OPERADORES",
    subtitle: "Palavras que ajudam a compor expressões.",
    lexemes: [
      "and",
      "or",
      "not",
      "less",
      "less_equal",
      "greater",
      "greater_equal",
      "equals",
      "not_equal",
    ],
    icon: Sigma,
  },
];
