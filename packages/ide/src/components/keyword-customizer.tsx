import Image from "next/image";
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
import { TokenPreview } from "./keyword-customizer/token-preview";

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
      <section className="flex flex-col gap-8 max-w-screen-3xl mx-auto">
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

          <main className="grid items-start  lg:grid-cols-[230px_minmax(0,1fr)_260px] xl:grid-cols-[340px_minmax(0,1fr)_360px]">
            <div className="flex flex-col gap-3">
              <WizardStepper
                steps={visibleSteps}
                activeStepId={activeStep.id}
                onStepClick={actions.goToWizardStep}
              />
              <LanguageBasedCard preview={preview} />
              <TokenPreview tokens={preview.tokenPreview} />
            </div>

            <div className="border-t border-r border-slate-200/70 dark:border-slate-800/80 xl:border-x xl:border-t-0">
              <div className="min-h-0 flex-1 p-5">
                <KeywordCustomizerStepContent />
                <KeywordCustomizerFooter
                  activeStepIndex={activeStepIndex}
                  totalSteps={visibleSteps.length}
                  onBack={actions.goToPreviousWizardStep}
                  onNext={actions.goToNextWizardStep}
                  onSave={actions.save}
                />
              </div>
            </div>
            <PreviewPanel preview={preview} />
          </main>
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
  const imageUrl = preview.languageImageUrl || "/images/language-default.png";

  return (
    <section className="mr-2 space-y-4 rounded-2xl border border-slate-200/80 bg-white/90 p-4 shadow-[0_18px_50px_-30px_rgba(15,23,42,0.55)] dark:border-slate-800 dark:bg-slate-900/90">
      <div className="space-y-1 px-1">
        <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-slate-500 dark:text-slate-400">
          Baseado em
        </p>
        <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
          {preview.basedOnLabel}
        </h3>
      </div>

      <div className="group relative overflow-hidden rounded-2xl bg-slate-950 shadow-lg ring-1 ring-white/10 dark:border-slate-800">
        <div className="absolute inset-0 bg-linear-to-b from-slate-950/5 via-slate-950/10 to-slate-950/80" />
        <div className="absolute inset-x-0 top-0 h-24 bg-linear-to-b from-white/15 to-transparent dark:from-white/5" />
        <Image
          src={imageUrl}
          alt={preview.languageLabel}
          width={640}
          height={260}
          unoptimized
          className="h-32 w-full object-cover object-center opacity-95 transition duration-500 group-hover:scale-[1.02]"
        />

        <div className="absolute inset-x-0 bottom-0 z-10">
          <div className="rounded-xl border border-white/10 bg-slate-950/55 p-2 backdrop-blur-[3px]">
            <p className="text-[8px] font-semibold uppercase tracking-[0.32em] text-cyan-200/80">
              Nome da linguagem
            </p>
            <p className="mt-1 text-sm font-semibold tracking-[0.02em] text-white">
              {preview.languageLabel}
            </p>
          </div>
        </div>

        <div className="pointer-events-none absolute inset-0 ring-1 ring-inset ring-cyan-400/10" />
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
