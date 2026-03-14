export function EditorSkeleton() {
  return (
    <div className="relative rounded-2xl animate-pulse">
      <div className="rounded-2xl border border-black/10 dark:border-white/10 bg-gray-100/70 dark:bg-neutral-950/70 shadow-[0_20px_60px_-40px_rgba(0,0,0,0.8)]">
        <div className="h-12 border-b border-black/10 dark:border-white/10 px-4 flex items-center gap-3">
          <div className="h-2.5 w-2.5 rounded-full bg-slate-300/70 dark:bg-slate-700/80" />
          <div className="h-2.5 w-2.5 rounded-full bg-slate-300/70 dark:bg-slate-700/80" />
          <div className="h-2.5 w-2.5 rounded-full bg-slate-300/70 dark:bg-slate-700/80" />
          <div className="ml-3 h-4 w-40 rounded bg-slate-300/70 dark:bg-slate-700/80" />
        </div>

        <div className="flex h-[70vh] overflow-hidden rounded-b-2xl">
          <div className="w-12 border-r border-black/10 dark:border-white/10 p-2 space-y-2">
            <div className="h-7 rounded-md bg-slate-300/70 dark:bg-slate-700/80" />
            <div className="h-7 rounded-md bg-slate-300/60 dark:bg-slate-700/70" />
            <div className="h-7 rounded-md bg-slate-300/60 dark:bg-slate-700/70" />
          </div>

          <div className="hidden sm:block w-70 border-r border-black/10 dark:border-white/10 p-3 space-y-3">
            <div className="h-4 w-28 rounded bg-slate-300/70 dark:bg-slate-700/80" />
            <div className="h-8 rounded-lg bg-slate-300/60 dark:bg-slate-700/70" />
            <div className="h-8 rounded-lg bg-slate-300/60 dark:bg-slate-700/70" />
            <div className="h-8 rounded-lg bg-slate-300/60 dark:bg-slate-700/70" />
            <div className="h-8 rounded-lg bg-slate-300/60 dark:bg-slate-700/70" />
          </div>

          <div className="flex-1 flex flex-col min-w-0">
            <div className="h-9 border-b border-black/10 dark:border-white/10 px-3 flex items-center gap-2">
              <div className="h-6 w-28 rounded-md bg-slate-300/70 dark:bg-slate-700/80" />
              <div className="h-6 w-24 rounded-md bg-slate-300/60 dark:bg-slate-700/70" />
            </div>

            <div className="flex-1 p-4">
              <div className="h-full w-full rounded-xl border border-black/10 dark:border-white/10 bg-black/5 dark:bg-white/3 p-3 space-y-2">
                <div className="h-3 w-2/3 rounded bg-slate-300/70 dark:bg-slate-700/80" />
                <div className="h-3 w-3/5 rounded bg-slate-300/60 dark:bg-slate-700/70" />
                <div className="h-3 w-4/5 rounded bg-slate-300/60 dark:bg-slate-700/70" />
                <div className="h-3 w-1/2 rounded bg-slate-300/60 dark:bg-slate-700/70" />
                <div className="h-3 w-3/4 rounded bg-slate-300/60 dark:bg-slate-700/70" />
              </div>
            </div>

            <div className="h-30 border-t border-black/10 dark:border-white/10 px-3 py-2 space-y-2">
              <div className="h-3 w-24 rounded bg-slate-300/70 dark:bg-slate-700/80" />
              <div className="h-3 w-2/3 rounded bg-slate-300/60 dark:bg-slate-700/70" />
              <div className="h-3 w-1/3 rounded bg-slate-300/60 dark:bg-slate-700/70" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
