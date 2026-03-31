import type { WizardPreview } from "./preview-data";
import { ChangedChip } from "./changed-chip";
import { ExampleSnippet } from "./example-snippet";
import { TokenPreview } from "./token-preview";

type PreviewPanelProps = {
  preview: WizardPreview;
};

type SemanticToken =
  | "keyword.type"
  | "keyword.conditional"
  | "keyword.loop"
  | "keyword.flow"
  | "keyword.io"
  | "keyword"
  | "keyword.block-delimiter"
  | "keyword.statement-terminator"
  | "keyword.boolean-literal"
  | "keyword.operator-word";

function resolveKeywordSemanticToken(original: string): SemanticToken {
  const TYPES = new Set([
    "int",
    "float",
    "bool",
    "string",
    "void",
    "variavel",
    "funcao",
  ]);
  const CONDITIONALS = new Set(["if", "else", "switch", "case", "default"]);
  const LOOPS = new Set(["for", "while"]);
  const FLOW = new Set(["break", "continue", "return"]);
  const IO = new Set(["print", "scan"]);
  const BLOCK_DELIMITERS = new Set(["{", "}"]);
  const STATEMENT_TERMINATORS = new Set([";"]);
  const BOOLEAN_LITERALS = new Set(["true", "false"]);
  const OPERATOR_WORDS = new Set([
    "and",
    "or",
    "not",
    "less",
    "less_equal",
    "greater",
    "greater_equal",
    "equals",
    "not_equal",
  ]);

  if (TYPES.has(original)) return "keyword.type";
  if (CONDITIONALS.has(original)) return "keyword.conditional";
  if (LOOPS.has(original)) return "keyword.loop";
  if (FLOW.has(original)) return "keyword.flow";
  if (IO.has(original)) return "keyword.io";
  if (BLOCK_DELIMITERS.has(original)) return "keyword.block-delimiter";
  if (STATEMENT_TERMINATORS.has(original))
    return "keyword.statement-terminator";
  if (BOOLEAN_LITERALS.has(original)) return "keyword.boolean-literal";
  if (OPERATOR_WORDS.has(original)) return "keyword.operator-word";

  return "keyword";
}

function resolveChipBorderClass(original: string): string {
  const token = resolveKeywordSemanticToken(original);

  switch (token) {
    case "keyword.type":
      return "border-[#0f766e]/50 dark:border-[#7dd3fc]/50";
    case "keyword.conditional":
      return "border-[#b45309]/50 dark:border-[#fbbf24]/50";
    case "keyword.loop":
      return "border-[#be123c]/50 dark:border-[#fb7185]/50";
    case "keyword.flow":
      return "border-[#7c3aed]/50 dark:border-[#c084fc]/50";
    case "keyword.io":
      return "border-[#047857]/50 dark:border-[#34d399]/50";
    case "keyword.block-delimiter":
      return "border-[#78350f]/50 dark:border-[#f59e0b]/50";
    case "keyword.statement-terminator":
      return "border-[#374151]/50 dark:border-[#9ca3af]/50";
    case "keyword.boolean-literal":
      return "border-[#166534]/50 dark:border-[#15803d]/50";
    case "keyword.operator-word":
      return "border-[#1e293b]/50 dark:border-[#475569]/50";
    default:
      return "border-slate-300/50 dark:border-slate-700/50";
  }
}

function resolveChipChangedTextClass(original: string): string {
  const token = resolveKeywordSemanticToken(original);

  switch (token) {
    case "keyword.type":
      return "text-[#0f766e] dark:text-[#7dd3fc]";
    case "keyword.conditional":
      return "text-[#b45309] dark:text-[#fbbf24]";
    case "keyword.loop":
      return "text-[#be123c] dark:text-[#fb7185]";
    case "keyword.flow":
      return "text-[#7c3aed] dark:text-[#c084fc]";
    case "keyword.io":
      return "text-[#047857] dark:text-[#34d399]";
    case "keyword.block-delimiter":
      return "text-[#78350f] dark:text-[#f59e0b]";
    case "keyword.statement-terminator":
      return "text-[#374151] dark:text-[#9ca3af]";
    case "keyword.boolean-literal":
      return "text-[#166534] dark:text-[#15803d]";
    case "keyword.operator-word":
      return "text-[#1e293b] dark:text-[#475569]";
    default:
      return "text-slate-700 dark:text-slate-300";
  }
}

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
                  className={resolveChipBorderClass(mapping.original)}
                  colorClassName={resolveChipChangedTextClass(mapping.original)}
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
