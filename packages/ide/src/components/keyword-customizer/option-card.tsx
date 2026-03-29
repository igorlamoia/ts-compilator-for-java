type OptionCardProps = {
  title: string;
  description: string;
  snippet?: string;
  selected?: boolean;
  disabled?: boolean;
  onClick?: () => void;
};

export function OptionCard({
  title,
  description,
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
        "group flex w-full flex-col gap-3 rounded-2xl border p-4 text-left transition-all",
        "bg-white/80 dark:bg-slate-900/80",
        selected
          ? "border-cyan-500 bg-cyan-50/80 shadow-[0_0_0_1px_rgba(6,182,212,0.15)] dark:border-cyan-400 dark:bg-slate-900"
          : "border-slate-200/80 dark:border-slate-800/80",
        disabled ? "cursor-not-allowed opacity-50" : "cursor-pointer hover:border-cyan-300 hover:bg-cyan-50/40 dark:hover:border-cyan-700",
      ].join(" ")}
    >
      <div className="space-y-1">
        <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">
          {title}
        </p>
        <p className="text-xs leading-5 text-slate-600 dark:text-slate-400">
          {description}
        </p>
      </div>

      {snippet && (
        <pre className="overflow-x-auto rounded-xl border border-slate-200/80 bg-slate-950 px-3 py-2 font-mono text-[11px] text-cyan-100 dark:border-slate-800">
          <code>{snippet}</code>
        </pre>
      )}
    </button>
  );
}
