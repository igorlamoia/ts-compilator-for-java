import { ExampleSnippet } from "../example-snippet";
import { KeywordReferenceTable } from "./components/keyword-reference-table";

const FLOW_FIELDS = [
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
] as const;

export type FlowStepProps = {
  values: {
    snippet?: string;
    fields: Array<{
      key: (typeof FLOW_FIELDS)[number];
      value: string;
      description: string;
    }>;
    currentVocabulary: string[];
  };
  actions: {
    syncKeyword: (
      original: (typeof FLOW_FIELDS)[number],
      value: string,
    ) => void;
    syncKeywordDescription: (
      original: (typeof FLOW_FIELDS)[number],
      value: string,
    ) => void;
  };
};

type FlowFieldKey = (typeof FLOW_FIELDS)[number];

const FLOW_REFERENCE_META: Record<
  FlowFieldKey,
  { glyph: string; className: string }
> = {
  if: {
    glyph: "IF",
    className: "text-cyan-300 shadow-[0_0_20px_-8px_rgba(34,211,238,0.95)]",
  },
  else: {
    glyph: "EL",
    className: "text-violet-300 shadow-[0_0_20px_-8px_rgba(196,181,253,0.9)]",
  },
  while: {
    glyph: "WH",
    className: "text-emerald-300 shadow-[0_0_20px_-8px_rgba(110,231,183,0.9)]",
  },
  for: {
    glyph: "FR",
    className: "text-emerald-300 shadow-[0_0_20px_-8px_rgba(110,231,183,0.9)]",
  },
  return: {
    glyph: "RT",
    className: "text-amber-300 shadow-[0_0_20px_-8px_rgba(251,191,36,0.9)]",
  },
  break: {
    glyph: "BR",
    className: "text-rose-300 shadow-[0_0_20px_-8px_rgba(253,164,175,0.9)]",
  },
  continue: {
    glyph: "CT",
    className: "text-sky-300 shadow-[0_0_20px_-8px_rgba(125,211,252,0.9)]",
  },
  switch: {
    glyph: "SW",
    className: "text-indigo-300 shadow-[0_0_20px_-8px_rgba(165,180,252,0.9)]",
  },
  case: {
    glyph: "CS",
    className: "text-fuchsia-300 shadow-[0_0_20px_-8px_rgba(240,171,252,0.9)]",
  },
  default: {
    glyph: "DF",
    className: "text-slate-300 shadow-[0_0_20px_-8px_rgba(148,163,184,0.75)]",
  },
};

export function FlowStep({ values, actions }: FlowStepProps) {
  return (
    <section className="space-y-6">
      <header className="space-y-2">
        <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-slate-500 dark:text-slate-400">
          Etapa 5
        </p>
        <h3 className="text-xl font-semibold text-slate-900 dark:text-slate-100">
          Fluxo
        </h3>
        <p className="max-w-3xl text-sm text-slate-600 dark:text-slate-400">
          Ajuste o vocabulário usado para controle de fluxo e navegação.
        </p>
      </header>

      <KeywordReferenceTable
        title="Palavras de fluxo"
        items={values.fields.map((field) => ({
          id: field.key,
          value: field.value,
          description: field.description,
          reference: {
            ...FLOW_REFERENCE_META[field.key],
            label: field.key.toUpperCase(),
          },
        }))}
        onValueChange={(field, value) => actions.syncKeyword(field, value)}
        onDescriptionChange={(field, value) =>
          actions.syncKeywordDescription(field, value)
        }
      />

      <div className="rounded-lg border border-slate-200/80 bg-white/80 p-4 dark:border-slate-800/80 dark:bg-slate-900/80">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400">
          Vocabulário atual da linguagem
        </p>
        <div className="mt-3 flex flex-wrap gap-2">
          {values.currentVocabulary.map((token) => (
            <span
              key={token}
              className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs text-slate-700 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-300"
            >
              {token}
            </span>
          ))}
        </div>
      </div>

      <ExampleSnippet
        title="Exemplo de fluxo"
        code={values.snippet ?? "while (condicao) {\n  return valor\n}"}
      />
    </section>
  );
}
