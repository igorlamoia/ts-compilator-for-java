import {
  Blocks,
  BookOpenText,
  ClipboardCheck,
  FingerprintPattern,
  Route,
  Sigma,
} from "lucide-react";
import type { WizardStepIcon, WizardStepId } from "./wizard-model";
import { Pointer } from "../ui/pointer";
import React from "react";

type WizardStep = {
  id: WizardStepId;
  title: string;
  description: string;
  icon: WizardStepIcon;
};

type WizardStepperProps = {
  steps: readonly WizardStep[];
  activeStepId: WizardStepId;
  onStepClick: (stepId: WizardStepId) => void;
};

export function WizardStepper({
  steps,
  activeStepId,
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
    <aside className="flex flex-col gap-6 border-b border-slate-200/70 dark:border-slate-800/80 lg:border-b-0 lg:border-r">
      <div className="pr-2">
        <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-slate-500 dark:text-slate-400">
          Progresso
        </p>
        <div className="flex items-end justify-between gap-4">
          <div>
            <p className="text-2xl font-semibold text-slate-900 dark:text-slate-100">
              {String(activeIndex + 1).padStart(2, "0")}
            </p>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              de {steps.length} etapas
            </p>
          </div>
          <p className="text-xs font-medium text-cyan-600 dark:text-cyan-300">
            {progress}%
          </p>
        </div>
        <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-slate-200 dark:bg-slate-800">
          <div
            className="h-full rounded-full bg-linear-to-r from-cyan-500 to-emerald-400"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      <div className="flex flex-col gap-1">
        {steps.map((step) => {
          const isActive = step.id === activeStepId;

          return (
            <button
              key={step.id}
              type="button"
              onClick={() => onStepClick(step.id)}
              className={[
                "flex items-center gap-3 border-l-4 px-3 py-2.5 transition-all",
                isActive
                  ? "border-l-cyan-500 bg-slate-900/40 text-cyan-400 dark:text-cyan-300"
                  : "border-l-transparent text-slate-400 hover:text-slate-300 dark:text-slate-500 dark:hover:text-slate-400",
              ].join(" ")}
              style={
                {
                  WebkitMaskImage:
                    "linear-gradient(to right, transparent, black 0%, black 70%, transparent), linear-gradient(to bottom, transparent, black 0%, black 70%, transparent)",
                  WebkitMaskComposite: "source-in",
                  maskImage:
                    "linear-gradient(to right, transparent, black 0%, black 70%, transparent)",
                } as React.CSSProperties
              }
            >
              <span className="flex h-5 w-5 items-center justify-center">
                {getStepIcon(step.icon)}
              </span>
              <span className="text-xs font-medium uppercase tracking-widest">
                {step.title}
              </span>
            </button>
          );
        })}
      </div>
    </aside>
  );
}
