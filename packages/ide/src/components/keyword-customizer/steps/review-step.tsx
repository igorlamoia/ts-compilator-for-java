import type { WizardPreview } from "../preview-data";
import { WIZARD_STEPS, type WizardStepId } from "../wizard-model";
import { PreviewCodeComparison } from "../preview-code-comparison";
import { TokenPreview } from "../token-preview";
import Image from "next/image";
import LaserFlow from "../../laser-flow";

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
  return (
    <section className="relative overflow-hidden space-y-6">
      <header className="space-y-2">
        <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-slate-500 dark:text-slate-400">
          Etapa 6
        </p>
        <h3 className="text-xl font-semibold text-slate-900 dark:text-slate-100">
          Revisão
        </h3>
        <p className="max-w-3xl text-sm text-slate-600 dark:text-slate-400">
          Confira o resumo final antes de aplicar a configuração.
        </p>
      </header>
      <div className="relative overflow-hidden">
        <div className="pointer-events-none absolute inset-0 z-9000 backdrop-blur-[1px]">
          <LaserFlow
            color="#22d3ee"
            horizontalBeamOffset={0.08}
            verticalBeamOffset={-0.14}
            // fogIntensity={0.85}
            // wispIntensity={6.5}
            // className="opacity-70"
            horizontalSizing={0.6}
            verticalSizing={2}
            wispDensity={1}
            wispSpeed={15}
            wispIntensity={5}
            flowSpeed={0.35}
            flowStrength={0.25}
            fogIntensity={0.45}
            fogScale={0.3}
            fogFallSpeed={0.6}
            decay={1.1}
            falloffStart={1.2}
          />
        </div>
        <div className="relative z-10 space-y-6">
          <div className="grid gap-4 xl:grid-cols-2">
            <div className="rounded-lg border border-slate-200/80 bg-white/85 p-4 backdrop-blur dark:border-slate-800/80 dark:bg-slate-900/70">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400">
                Nome da linguagem
              </p>
              <div className="mt-3 flex items-center gap-3">
                {values.preview.languageImageUrl ? (
                  <Image
                    src={values.preview.languageImageUrl}
                    alt={values.preview.languageLabel}
                    width={64}
                    height={64}
                    className="rounded-xl object-cover ring-1 ring-slate-200 dark:ring-slate-700"
                  />
                ) : null}
                <div className="space-y-1">
                  <p className="text-lg font-semibold text-slate-900 dark:text-slate-100">
                    {values.preview.languageLabel}
                  </p>
                  <p className="text-sm text-slate-500 dark:text-slate-400">
                    Baseado em {values.preview.basedOnLabel}
                  </p>
                </div>
              </div>
            </div>

            <div className="rounded-lg border border-slate-200/80 bg-white/85 p-4 backdrop-blur dark:border-slate-800/80 dark:bg-slate-900/70">
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

          <div className="rounded-lg border border-slate-200/80 bg-white/85 p-4 backdrop-blur dark:border-slate-800/80 dark:bg-slate-900/70">
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
        </div>
      </div>
      <BoxResult values={values} actions={actions} />
    </section>
  );
}

function BoxResult({ values, actions }: ReviewStepProps) {
  const stepLabels = new Map(
    WIZARD_STEPS.map((step) => [step.id, step.title] as const),
  );
  return (
    <div className="space-y-6 rounded-t-xl border-t-3 border-x-2 border-slate-200/80 bg-white/90 p-4 backdrop-blur dark:border-cyan-500/60 dark:bg-slate-950/80">
      <PreviewCodeComparison
        title="Comparação do código final"
        beforeCode={values.preview.baselineSnippet}
        afterCode={values.preview.snippet}
      />
      <TokenPreview tokens={values.preview.tokenPreview} />

      <div className="rounded-lg border border-slate-200/80 bg-white/90 p-4 backdrop-blur dark:border-slate-800/80 dark:bg-slate-900/80">
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
    </div>
  );
}
