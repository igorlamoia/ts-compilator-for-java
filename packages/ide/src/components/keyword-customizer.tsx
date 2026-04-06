import { Form } from "@/components/ui/form";
import {
  PreviewPanel,
  PreviewPanelProps,
} from "./keyword-customizer/preview-panel";
import { WizardStepper } from "./keyword-customizer/wizard-stepper";
import {
  KeywordCustomizerProvider,
  useKeywordCustomizer,
} from "./keyword-customizer/keyword-customizer-context";
import { KeywordCustomizerHeader } from "./keyword-customizer/keyword-customizer-header";
import { KeywordCustomizerFooter } from "./keyword-customizer/keyword-customizer-footer";
import { KeywordCustomizerStepContent } from "./keyword-customizer/keyword-customizer-step-content";

function KeywordCustomizerShell() {
  const {
    form,
    preview,
    activeStep,
    activeStepIndex,
    visibleSteps,
    hasChanges,
    actions,
  } = useKeywordCustomizer();

  return (
    <Form {...form}>
      <section className="flex flex-col gap-8 max-w-screen-2xl mx-auto">
        <form
          onSubmit={(event) => event.preventDefault()}
          aria-labelledby="keyword-customizer-title"
          aria-describedby="keyword-customizer-description"
          className="flex min-h-0 flex-col gap-8"
        >
          <KeywordCustomizerHeader
            hasChanges={hasChanges}
            onCancel={actions.exit}
            onReset={actions.resetDraft}
          />

          <div>
            <div className="grid min-h-0 flex-1 lg:grid-cols-[240px_minmax(0,1fr)_340px]">
              <div>
                <WizardStepper
                  steps={visibleSteps}
                  activeStepId={activeStep.id}
                  onStepClick={actions.goToWizardStep}
                />
                <LanguageBasedCard preview={preview} />
              </div>

              <div className="min-h-0 overflow-y-auto border-t border-slate-200/70  dark:border-slate-800/80  xl:border-x xl:border-t-0">
                <div className="min-h-0 flex-1 overflow-y-auto p-5">
                  <KeywordCustomizerStepContent />
                </div>
              </div>

              <PreviewPanel preview={preview} />
            </div>
          </div>

          <KeywordCustomizerFooter
            activeStepIndex={activeStepIndex}
            totalSteps={visibleSteps.length}
            onBack={actions.goToPreviousWizardStep}
            onNext={actions.goToNextWizardStep}
            onSave={actions.save}
          />
        </form>
      </section>
    </Form>
  );
}

export function KeywordCustomizer() {
  return (
    <KeywordCustomizerProvider>
      <KeywordCustomizerShell />
    </KeywordCustomizerProvider>
  );
}

function LanguageBasedCard({
  preview,
}: {
  preview: PreviewPanelProps["preview"];
}) {
  return (
    <section className="mt-6 mr-2 space-y-3 rounded-lg border border-slate-200/80 bg-white/90 p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900/90">
      <div className="space-y-1">
        <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-slate-500 dark:text-slate-400">
          Baseado em
        </p>
        <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
          {preview.basedOnLabel}
        </h3>
      </div>

      <div className="space-y-3 rounded-lg border border-slate-200/70 bg-slate-50/80 p-3 dark:border-slate-800/70 dark:bg-slate-950/60">
        <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400">
          Nome da linguagem
        </p>
        <div className="flex items-center gap-3">
          {preview.languageImageUrl ? (
            <img
              src={preview.languageImageUrl}
              alt={preview.languageLabel}
              className="h-14 w-14 rounded-xl object-cover ring-1 ring-slate-200 dark:ring-slate-700"
            />
          ) : null}
          <h4 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
            {preview.languageLabel}
          </h4>
        </div>
      </div>

      <div className="space-y-2">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400">
          DNA da linguagem
        </p>
        <div className="flex flex-wrap gap-2">
          {preview.dna.map((item) => (
            <span
              key={item}
              className="rounded-lg border border-cyan-200 bg-cyan-50 px-3 py-1 text-xs font-medium text-cyan-700 dark:border-cyan-900 dark:bg-cyan-950/60 dark:text-cyan-200"
            >
              {item}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}
