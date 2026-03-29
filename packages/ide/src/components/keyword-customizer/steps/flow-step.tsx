import { Input } from "@/components/ui/input";
import type { StoredKeywordCustomization } from "@/contexts/keyword/types";
import { ExampleSnippet } from "../example-snippet";

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
  draftCustomization: StoredKeywordCustomization;
  snippet?: string;
  onKeywordChange: (
    original: (typeof FLOW_FIELDS)[number],
    value: string,
  ) => void;
};

export function FlowStep({
  draftCustomization,
  snippet,
  onKeywordChange,
}: FlowStepProps) {
  const currentVocabulary = draftCustomization.mappings.filter((mapping) =>
    FLOW_FIELDS.includes(mapping.original as (typeof FLOW_FIELDS)[number]),
  );

  return (
    <section className="space-y-6">
      <header className="space-y-2">
        <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-slate-500 dark:text-slate-400">
          Etapa 5
        </p>
        <h3 className="text-xl font-semibold text-slate-900 dark:text-slate-100">
          Fluxo
        </h3>
        <p className="max-w-2xl text-sm text-slate-600 dark:text-slate-400">
          Ajuste o vocabulário usado para controle de fluxo e navegação.
        </p>
      </header>

      <div className="grid gap-4 md:grid-cols-2">
        {FLOW_FIELDS.map((field) => {
          const value =
            draftCustomization.mappings.find((mapping) => mapping.original === field)
              ?.custom ?? field;

          return (
            <label
              key={field}
              className="flex flex-col gap-2 rounded-2xl border border-slate-200/80 bg-white/80 p-4 dark:border-slate-800/80 dark:bg-slate-900/80"
            >
              <span className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                {field}
              </span>
              <Input
                value={value}
                onChange={(event) => onKeywordChange(field, event.target.value)}
                className="font-mono"
                spellCheck={false}
              />
            </label>
          );
        })}
      </div>

      <div className="rounded-2xl border border-slate-200/80 bg-white/80 p-4 dark:border-slate-800/80 dark:bg-slate-900/80">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400">
          Vocabulário atual da linguagem
        </p>
        <div className="mt-3 flex flex-wrap gap-2">
          {currentVocabulary.map((mapping) => (
            <span
              key={mapping.original}
              className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs text-slate-700 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-300"
            >
              {mapping.custom}
            </span>
          ))}
        </div>
      </div>

      <ExampleSnippet
        title="Exemplo de fluxo"
        code={snippet ?? "while (condicao) {\n  return valor\n}"}
      />
    </section>
  );
}
