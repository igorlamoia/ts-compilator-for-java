import type { WizardPreview } from "./preview-data";
import { ChangedChip } from "./changed-chip";
import { ExampleSnippet } from "./example-snippet";
import { TokenPreview } from "./token-preview";

type PreviewPanelProps = {
  preview: WizardPreview;
};

export function PreviewPanel({ preview }: PreviewPanelProps) {
  return (
    <aside className="min-h-0 overflow-y-auto border-t border-slate-200/70  p-5 dark:border-slate-800/80 lg:border-l lg:border-t-0 lg:p-6">
      <div className="space-y-6 lg:sticky lg:top-0">
        <section className="space-y-3 rounded-lg border border-slate-200/80 bg-white/90 p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900/90">
          <div className="space-y-1">
            <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-slate-500 dark:text-slate-400">
              Baseado em
            </p>
            <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
              {preview.languageLabel}
            </h3>
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

        <ExampleSnippet title="Preview do código" code={preview.snippet} />
        <TokenPreview tokens={preview.tokenPreview} />

        <section className="space-y-3 rounded-lg border border-slate-200/80 bg-white/90 p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900/90">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400">
            Resumo parcial
          </p>
          <div className="flex flex-wrap gap-2">
            {preview.chosenLexemes.length ? (
              preview.chosenLexemes.map((mapping) => (
                <ChangedChip
                  key={mapping.original}
                  original={mapping.original}
                  changed={mapping.custom}
                />
              ))
            ) : (
              <p className="text-xs text-slate-500 dark:text-slate-400">
                As escolhas personalizadas vao aparecer aqui conforme o fluxo
                avanca.
              </p>
            )}
          </div>
        </section>
      </div>
    </aside>
  );
}
