export function OpenFIlesList({
  openTabs,
  activeFile,
  closeTab,
}: {
  openTabs: string[];
  activeFile: string;
  closeTab: (path: string) => void;
}) {
  return (
    <div className="flex items-center gap-2 overflow-x-auto border-b border-black/10 dark:border-white/10 bg-white/5 px-2 py-2">
      {openTabs.map((tab) => (
        <div
          key={tab}
          className={`flex items-center gap-2 rounded-md px-3 py-1 text-xs ${
            activeFile === tab
              ? "bg-white/15 text-foreground"
              : "text-muted-foreground"
          }`}
        >
          <span className="truncate">{tab}</span>
          <button
            type="button"
            onClick={() => closeTab(tab)}
            className="text-muted-foreground hover:text-foreground"
          >
            ×
          </button>
        </div>
      ))}
    </div>
  );
}
