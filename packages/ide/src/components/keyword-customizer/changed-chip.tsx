import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

type ChangedChipProps = {
  original: string;
  changed: string;
  active?: boolean;
  className?: string;
  originalClassName?: string;
  separator?: ReactNode;
  separatorClassName?: string;
  changedClassName?: string;
  colorClassName?: string;
};

const DEFAULT_CHANGED_COLOR = "text-cyan-600 dark:text-cyan-300";

export function ChangedChip({
  original,
  changed,
  active = false,
  className,
  originalClassName,
  separator = "→",
  separatorClassName,
  changedClassName,
  colorClassName = DEFAULT_CHANGED_COLOR,
}: ChangedChipProps) {
  const isChanged = changed !== original;

  return (
    <div
      className={cn(
        "z-10 inline-flex min-w-38 items-center justify-center gap-2 rounded-md border px-3 py-1.5 text-xs transition-colors",
        active
          ? "border-cyan-500/30 bg-cyan-50 dark:border-cyan-400/50 dark:bg-cyan-950/50"
          : "border-slate-200/30 bg-white dark:border-slate-700/50 dark:bg-slate-900",
        className,
      )}
    >
      <span className={cn("font-mono", originalClassName)}>{original}</span>
      <span className={cn("text-slate-400", separatorClassName)}>
        {separator}
      </span>
      <span
        className={cn(
          "font-semibold",
          isChanged ? colorClassName : "text-slate-700 dark:text-slate-300",
          changedClassName,
        )}
      >
        {changed}
      </span>
    </div>
  );
}
