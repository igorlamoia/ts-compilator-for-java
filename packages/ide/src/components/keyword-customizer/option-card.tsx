import type { ReactNode } from "react";

export type OptionCardIconColor =
  | "cyan"
  | "emerald"
  | "violet"
  | "amber"
  | "rose"
  | "slate";

const ICON_COLOR_CLASSES: Record<OptionCardIconColor, string> = {
  cyan: "bg-cyan-100/70 text-cyan-700 ring-cyan-300/60 dark:bg-cyan-900/30 dark:text-cyan-300 dark:ring-cyan-500/40",
  emerald:
    "bg-emerald-100/70 text-emerald-700 ring-emerald-300/60 dark:bg-emerald-900/30 dark:text-emerald-300 dark:ring-emerald-500/40",
  violet:
    "bg-violet-100/70 text-violet-700 ring-violet-300/60 dark:bg-violet-900/30 dark:text-violet-300 dark:ring-violet-500/40",
  amber:
    "bg-amber-100/70 text-amber-700 ring-amber-300/60 dark:bg-amber-900/30 dark:text-amber-300 dark:ring-amber-500/40",
  rose: "bg-rose-100/70 text-rose-700 ring-rose-300/60 dark:bg-rose-900/30 dark:text-rose-300 dark:ring-rose-500/40",
  slate:
    "bg-slate-100/80 text-slate-700 ring-slate-300/70 dark:bg-slate-800/70 dark:text-slate-200 dark:ring-slate-600/60",
};

type OptionCardIconProps = {
  icon?: ReactNode;
  color?: OptionCardIconColor;
};

export function OptionCardIcon({ icon, color = "cyan" }: OptionCardIconProps) {
  return (
    <span
      className={[
        "flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ring-1",
        ICON_COLOR_CLASSES[color],
      ].join(" ")}
    >
      {icon ?? <span className="h-2 w-2 rounded-lg bg-current" />}
    </span>
  );
}

type OptionCardProps = {
  title: string;
  subtitle?: string;
  description: string;
  icon?: ReactNode;
  iconColor?: OptionCardIconColor;
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
  iconColor = "cyan",
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
        "group flex w-full flex-col gap-4 rounded-lg border border-transparent p-5 text-left transition-all",
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
        <OptionCardIcon icon={icon} color={iconColor} />
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
        <pre className="overflow-x-auto rounded-lg bg-slate-100 px-3 py-2 font-mono text-sm text-cyan-700 ring-1 ring-slate-200 dark:bg-black dark:text-cyan-200 dark:ring-slate-900">
          <code>{snippet}</code>
        </pre>
      )}

      <p className="text-sm leading-5 text-slate-600 dark:text-slate-400">
        {description}
      </p>
    </button>
  );
}
