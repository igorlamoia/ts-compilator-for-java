import {
  Blocks,
  BookOpenText,
  ClipboardCheck,
  FingerprintPattern,
  Route,
  Sigma,
} from "lucide-react";
import type { WizardStepIcon, WizardStepId } from "./wizard-model";

type WizardStep = {
  id: WizardStepId;
  title: string;
  description: string;
  icon: WizardStepIcon;
};

type WizardStepperProps = {
  steps: readonly WizardStep[];
  activeStepId: WizardStepId;
  visitedStepIds: WizardStepId[];
  onStepClick: (stepId: WizardStepId) => void;
};

export function WizardStepper({
  steps,
  activeStepId,
  visitedStepIds,
  onStepClick,
}: WizardStepperProps) {
  const activeIndex = steps.findIndex((step) => step.id === activeStepId);
  const progress = Math.round(((activeIndex + 1) / steps.length) * 100);

  const getStepIcon = (icon: WizardStepIcon) => {
    const className = "h-4 w-4";

    if (icon === "fingerprint")
      return <FingerprintPattern className={className} />;
    if (icon === "book-open-text")
      return <BookOpenText className={className} />;
    if (icon === "blocks") return <Blocks className={className} />;
    if (icon === "sigma") return <Sigma className={className} />;
    if (icon === "route") return <Route className={className} />;
    return <ClipboardCheck className={className} />;
  };

  return (
    <aside className="border-b border-slate-200/70 p-5 dark:border-slate-800/80  lg:border-b-0 lg:border-r lg:p-6">
      <div className="space-y-5 lg:sticky lg:top-0">
        <div className="space-y-2">
          <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-slate-500 dark:text-slate-400">
            Fluxo guiado
          </p>
          <div className="flex items-end justify-between gap-4">
            <div>
              <p className="text-2xl font-semibold text-slate-900 dark:text-slate-100">
                {String(activeIndex + 1).padStart(2, "0")}
              </p>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                de {steps.length} etapas
              </p>
            </div>
            <p className="text-sm font-medium text-cyan-600 dark:text-cyan-300">
              {progress}%
            </p>
          </div>
          <div className="h-2 overflow-hidden rounded-full bg-slate-200 dark:bg-slate-800">
            <div
              className="h-full rounded-full bg-linear-to-r from-cyan-500 to-emerald-400"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        <div className="grid gap-2">
          {steps.map((step, index) => {
            const isActive = step.id === activeStepId;
            const isVisited = visitedStepIds.includes(step.id);
            const status = isActive
              ? "Atual"
              : isVisited
                ? "Concluida"
                : "Pendente";

            return (
              <button
                key={step.id}
                type="button"
                onClick={() => onStepClick(step.id)}
                className={[
                  "flex items-start gap-3 rounded-2xl border p-3 text-left transition-all",
                  isActive
                    ? "border-cyan-500 bg-cyan-50 dark:border-cyan-400 dark:bg-cyan-950/40"
                    : "border-slate-200/80 bg-white/80 dark:border-slate-800 dark:bg-slate-900/80",
                  "cursor-pointer hover:border-cyan-300 dark:hover:border-cyan-700",
                ].join(" ")}
              >
                <span className="mt-0.5 flex h-9 w-9 items-center justify-center rounded-2xl border border-current text-cyan-600 dark:text-cyan-300">
                  {getStepIcon(step.icon)}
                </span>
                <span className="min-w-0">
                  <span className="block text-sm font-semibold text-slate-900 dark:text-slate-100">
                    {step.title}
                  </span>
                  <span className="block text-xs leading-5 text-slate-500 dark:text-slate-400">
                    {step.description}
                  </span>
                  <span className="mt-1 block text-[10px] uppercase tracking-[0.2em] text-slate-400 dark:text-slate-500">
                    {status}
                  </span>
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </aside>
  );
}
