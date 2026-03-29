import { Form } from "@/components/ui/form";
import { PreviewPanel } from "./keyword-customizer/preview-panel";
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

          <div className="backdrop-blur-[2px] ">
            <div className="grid min-h-0 flex-1 lg:grid-cols-[240px_minmax(0,1fr)_320px]">
              <WizardStepper
                steps={visibleSteps}
                activeStepId={activeStep.id}
                onStepClick={actions.goToWizardStep}
              />

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
