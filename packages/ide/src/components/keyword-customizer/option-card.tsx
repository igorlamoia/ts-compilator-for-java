import type { ReactNode } from "react";

type OptionCardProps = {
  title: string;
  subtitle?: string;
  description: string;
  icon?: ReactNode;
  snippet?: string;
  selected?: boolean;
  disabled?: boolean;
  onClick?: () => void;
};

export function OptionCard({
  title,
  subtitle,
  description,
  icon,
  snippet,
  selected = false,
  disabled = false,
  onClick,
}: OptionCardProps) {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      className={[
        "group flex w-full flex-col gap-4 rounded-xl border border-transparent p-5 text-left transition-all",
        "bg-white ring-1 ring-slate-200 dark:bg-slate-950/95 dark:ring-slate-900",
        selected
          ? "border-cyan-500 ring-cyan-500 shadow-[0_0_0_1px_rgba(34,211,238,0.35),0_18px_40px_-20px_rgba(6,182,212,0.35)] dark:border-cyan-400 dark:shadow-[0_0_0_1px_rgba(34,211,238,0.35),0_18px_40px_-20px_rgba(6,182,212,0.45)]"
          : "shadow-[0_10px_24px_-18px_rgba(15,23,42,0.35)] dark:shadow-[0_14px_32px_-20px_rgba(2,6,23,0.95)]",
        disabled
          ? "cursor-not-allowed opacity-50"
          : "cursor-pointer hover:ring-cyan-500 hover:shadow-[0_18px_40px_-20px_rgba(6,182,212,0.35)] dark:hover:ring-cyan-700",
      ].join(" ")}
    >
      <div className="flex items-center gap-3 ">
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-cyan-100 text-cyan-700  dark:bg-cyan-900/30 dark:text-cyan-300 ">
          {icon ?? <span className="h-2 w-2 rounded-full bg-cyan-300" />}
        </span>
        <p className="text-[10px] font-semibold uppercase tracking-[0.26em] text-slate-500 dark:text-slate-400">
          {subtitle ?? "Esqueceu de mim"}
        </p>
      </div>

      <div>
        <p className="text-3xl font-semibold leading-tight text-slate-900 dark:text-slate-100">
          {title}
        </p>
      </div>

      {snippet && (
        <pre className="overflow-x-auto rounded-xl bg-slate-100 px-3 py-2 font-mono text-sm text-cyan-700 ring-1 ring-slate-200 dark:bg-black dark:text-cyan-200 dark:ring-slate-900">
          <code>{snippet}</code>
        </pre>
      )}

      <p className="text-sm leading-5 text-slate-600 dark:text-slate-400">
        {description}
      </p>
    </button>
  );
}
