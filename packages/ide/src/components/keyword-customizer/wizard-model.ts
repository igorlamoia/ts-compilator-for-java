import type { StoredKeywordCustomization } from "@/contexts/keyword/types";

export type WizardStepId =
  | "identity"
  | "output"
  | "variables"
  | "structure"
  | "rules"
  | "flow"
  | "review";

export type WizardPresetId =
  | "traditional"
  | "didactic-pt"
  | "minimal"
  | "creative"
  | "free";

export const WIZARD_STEPS = [
  {
    id: "identity",
    title: "Identidade",
    description: "Escolha o ponto de partida da linguagem.",
  },
  {
    id: "output",
    title: "Saida",
    description: "Defina como a linguagem escreve mensagens.",
  },
  {
    id: "variables",
    title: "Variaveis",
    description: "Modele declaracao, tipagem e atribuicao.",
  },
  {
    id: "structure",
    title: "Estrutura",
    description: "Configure blocos e delimitadores.",
  },
  {
    id: "rules",
    title: "Regras",
    description: "Ajuste regras sintaticas suportadas hoje.",
  },
  {
    id: "flow",
    title: "Fluxo",
    description: "Customize o vocabulario de controle.",
  },
  {
    id: "review",
    title: "Revisao",
    description: "Confira o resumo final antes de salvar.",
  },
] as const;

const STEP_FIELDS: Record<WizardStepId, string[]> = {
  identity: [],
  output: ["print", "scan", "statementTerminatorLexeme", "modes.semicolon"],
  variables: [
    "int",
    "float",
    "bool",
    "string",
    "variavel",
    "modes.typing",
    "modes.array",
  ],
  structure: ["void", "funcao", "modes.block", "blockDelimiters"],
  rules: [
    "booleanLiteralMap",
    "operatorWordMap",
    "statementTerminatorLexeme",
    "modes.semicolon",
  ],
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
  if (presetId === "traditional" || presetId === "free") {
    return state;
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
      (current, [original, custom]) => replaceMapping(current, original, custom),
      state,
    );
  }

  if (presetId === "minimal") {
    return replaceMapping(replaceMapping(state, "print", "out"), "scan", "in");
  }

  return replaceMapping(replaceMapping(state, "print", "fale"), "return", "entregue");
}
