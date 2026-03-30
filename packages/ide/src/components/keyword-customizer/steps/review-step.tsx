import type { WizardPreview } from "../preview-data";
import { WIZARD_STEPS, type WizardStepId } from "../wizard-model";
import { ExampleSnippet } from "../example-snippet";
import { TokenPreview } from "../token-preview";

export type ReviewStepProps = {
  values: {
    preview: WizardPreview;
    editedMappings: Array<{
      original: string;
      custom: string;
    }>;
    visitedStepIds: WizardStepId[];
  };
  actions: {
    selectStep: (stepId: WizardStepId) => void;
  };
};

export function ReviewStep({ values, actions }: ReviewStepProps) {
  const stepLabels = new Map(
    WIZARD_STEPS.map((step) => [step.id, step.title] as const),
  );

  return (
    <section className="space-y-6">
      <header className="space-y-2">
        <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-slate-500 dark:text-slate-400">
          Etapa 6
        </p>
        <h3 className="text-xl font-semibold text-slate-900 dark:text-slate-100">
          Revisão
        </h3>
        <p className="max-w-2xl text-sm text-slate-600 dark:text-slate-400">
          Confira o resumo final antes de aplicar a configuração.
        </p>
      </header>

      <div className="grid gap-4 xl:grid-cols-2">
        <div className="rounded-lg border border-slate-200/80 bg-white/80 p-4 dark:border-slate-800/80 dark:bg-slate-900/80">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400">
            Nome da linguagem
          </p>
          <p className="mt-3 text-lg font-semibold text-slate-900 dark:text-slate-100">
            {values.preview.languageLabel}
          </p>
        </div>

        <div className="rounded-lg border border-slate-200/80 bg-white/80 p-4 dark:border-slate-800/80 dark:bg-slate-900/80">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400">
            Resumo das regras
          </p>
          <div className="mt-3 flex flex-wrap gap-2">
            {values.preview.dna.map((item) => (
              <span
                key={item}
                className="rounded-full border border-cyan-200 bg-cyan-50 px-3 py-1 text-xs text-cyan-700 dark:border-cyan-900 dark:bg-cyan-950/40 dark:text-cyan-200"
              >
                {item}
              </span>
            ))}
          </div>
          <div className="mt-4 space-y-2 text-sm text-slate-700 dark:text-slate-300">
            <p>
              As regras visíveis aqui já fazem parte do fluxo atual da
              linguagem.
            </p>
          </div>
        </div>
      </div>

      <div className="rounded-lg border border-slate-200/80 bg-white/80 p-4 dark:border-slate-800/80 dark:bg-slate-900/80">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400">
          Vocabulário atual da linguagem
        </p>
        <div className="mt-3 flex flex-wrap gap-2">
          {values.editedMappings.length ? (
            values.editedMappings.map((mapping) => (
              <span
                key={mapping.original}
                className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs text-slate-700 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-300"
              >
                {mapping.original} → {mapping.custom}
              </span>
            ))
          ) : (
            <span className="text-sm text-slate-500 dark:text-slate-400">
              Nenhum lexema foi alterado.
            </span>
          )}
        </div>
      </div>

      <ExampleSnippet title="Preview do código" code={values.preview.snippet} />
      <TokenPreview tokens={values.preview.tokenPreview} />

      <div className="rounded-lg border border-slate-200/80 bg-white/80 p-4 dark:border-slate-800/80 dark:bg-slate-900/80">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400">
          Voltar para editar
        </p>
        <div className="mt-3 flex flex-wrap gap-2">
          {values.visitedStepIds
            .filter((stepId) => stepId !== "review")
            .map((stepId) => (
              <button
                key={stepId}
                type="button"
                onClick={() => actions.selectStep(stepId)}
                className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-medium text-slate-700 transition-colors hover:border-cyan-300 hover:text-cyan-700 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-300 dark:hover:border-cyan-700 dark:hover:text-cyan-300"
              >
                {stepLabels.get(stepId) ?? stepId}
              </button>
            ))}
        </div>
      </div>
    </section>
  );
}
