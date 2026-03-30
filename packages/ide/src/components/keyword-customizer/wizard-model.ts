import type { StoredKeywordCustomization } from "@/contexts/keyword/types";

export type WizardStepId =
  | "identity"
  | "variables"
  | "structure"
  | "rules"
  | "flow"
  | "review";

export type WizardStepIcon =
  | "fingerprint"
  | "book-open-text"
  | "blocks"
  | "sigma"
  | "route"
  | "clipboard-check";

export type WizardPresetId =
  | "traditional"
  | "didactic-pt"
  | "minimal"
  | "creative"
  | "free";

export const WIZARD_PRESET_LABELS: Record<WizardPresetId, string> = {
  traditional: "Tradicional",
  "didactic-pt": "Didatica em Portugues",
  minimal: "Minimalista",
  creative: "Criativa",
  free: "Livre",
};

export const WIZARD_STEPS = [
  {
    id: "identity",
    title: "Identidade",
    description: "Escolha o ponto de partida da linguagem.",
    icon: "fingerprint",
  },
  {
    id: "variables",
    title: "Vocabulário",
    description: "Defina saída, leitura e a linguagem das variáveis.",
    icon: "book-open-text",
  },
  {
    id: "structure",
    title: "Estrutura",
    description: "Configure blocos, delimitadores e o fim das instruções.",
    icon: "blocks",
  },
  {
    id: "rules",
    title: "Regras",
    description: "Ajuste regras sintaticas suportadas hoje.",
    icon: "sigma",
  },
  {
    id: "flow",
    title: "Fluxo",
    description: "Customize o vocabulario de controle.",
    icon: "route",
  },
  {
    id: "review",
    title: "Revisão",
    description: "Confira o resumo final antes de salvar.",
    icon: "clipboard-check",
  },
] as const;

const STEP_FIELDS: Record<WizardStepId, string[]> = {
  identity: [],
  variables: [
    "print",
    "scan",
    "int",
    "float",
    "bool",
    "string",
    "variavel",
    "modes.typing",
    "modes.array",
  ],
  structure: [
    "statementTerminatorLexeme",
    "modes.semicolon",
    "void",
    "funcao",
    "modes.block",
    "blockDelimiters",
  ],
  rules: ["booleanLiteralMap", "operatorWordMap"],
  flow: [
    "if",
    "else",
    "while",
    "for",
    "return",
    "break",
    "continue",
    "switch",
    "case",
    "default",
  ],
  review: [],
};

export function getWizardStepFields(stepId: WizardStepId) {
  return STEP_FIELDS[stepId];
}

function replaceMapping(
  state: StoredKeywordCustomization,
  original: string,
  custom: string,
): StoredKeywordCustomization {
  return {
    ...state,
    mappings: state.mappings.map((item) =>
      item.original === original ? { ...item, custom } : item,
    ),
  };
}

export function applyWizardPreset(
  state: StoredKeywordCustomization,
  presetId: WizardPresetId,
): StoredKeywordCustomization {
  const baseState: StoredKeywordCustomization = {
    ...state,
    mappings: state.mappings.map((item) => ({
      ...item,
      custom: item.original,
    })),
    operatorWordMap: {},
    booleanLiteralMap: { true: "true", false: "false" },
    statementTerminatorLexeme: "",
    blockDelimiters: { open: "", close: "" },
  };

  if (presetId === "traditional" || presetId === "free") {
    return baseState;
  }

  if (presetId === "didactic-pt") {
    return [
      ["if", "se"],
      ["else", "senao"],
      ["while", "enquanto"],
      ["print", "escreva"],
      ["scan", "leia"],
      ["return", "retorne"],
    ].reduce(
      (current, [original, custom]) =>
        replaceMapping(current, original, custom),
      baseState,
    );
  }

  if (presetId === "minimal") {
    return replaceMapping(
      replaceMapping(baseState, "print", "out"),
      "scan",
      "in",
    );
  }

  return replaceMapping(
    replaceMapping(baseState, "print", "fale"),
    "return",
    "entregue",
  );
}
