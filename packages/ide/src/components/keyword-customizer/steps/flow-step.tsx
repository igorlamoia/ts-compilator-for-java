import { ExampleSnippet } from "../example-snippet";
import { DocumentedField } from "../documented-field";

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
        <p className="max-w-2xl text-sm text-slate-600 dark:text-slate-400">
          Ajuste o vocabulário usado para controle de fluxo e navegação.
        </p>
      </header>

      <div className="grid gap-4 md:grid-cols-2">
        {values.fields.map((field) => (
          <DocumentedField
            key={field.key}
            label={field.key}
            value={field.value}
            description={field.description}
            onValueChange={(nextValue) =>
              actions.syncKeyword(field.key, nextValue)
            }
            onDescriptionChange={(description) =>
              actions.syncKeywordDescription(field.key, description)
            }
          />
        ))}
      </div>

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
