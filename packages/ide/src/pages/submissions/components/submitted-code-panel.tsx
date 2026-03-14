import { CompileResultPanel } from "./compile-result-panel";

export function SubmittedCodePanel({
  codeSnapshot,
  exerciseDescription,
  compileResult,
  compiling,
  onRecompile,
}: {
  codeSnapshot: string | undefined;
  exerciseDescription: string | undefined;
  compileResult: any;
  compiling: boolean;
  onRecompile: () => void;
}) {
  return (
    <div className="lg:col-span-2 space-y-4">
      {/* Code */}
      <div className="bg-[#182f34]/40 backdrop-blur-xl border border-white/10 rounded-2xl overflow-hidden">
        <div className="flex justify-between items-center px-6 py-3 border-b border-white/5">
          <h3 className="text-sm font-semibold text-slate-300">
            Código Submetido
          </h3>
          <button
            onClick={onRecompile}
            disabled={compiling}
            className="px-4 py-1.5 rounded-lg text-xs font-bold bg-[#0dccf2]/10 hover:bg-[#0dccf2]/20 text-[#0dccf2] transition-all disabled:opacity-50"
          >
            {compiling ? "Compilando..." : "▶ Recompilar"}
          </button>
        </div>
        <pre className="p-6 text-sm font-mono text-slate-200 overflow-x-auto leading-relaxed max-h-[500px] overflow-y-auto bg-black/20">
          <code>
            {codeSnapshot || "Nenhum código enviado"}
          </code>
        </pre>
      </div>

      <CompileResultPanel compileResult={compileResult} />

      {/* Exercise Description */}
      <div className="bg-[#182f34]/40 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
        <h3 className="text-sm font-semibold text-[#0dccf2] uppercase tracking-wider mb-3">
          Enunciado do Exercício
        </h3>
        <p className="text-sm text-slate-300 leading-relaxed whitespace-pre-wrap">
          {exerciseDescription}
        </p>
      </div>
    </div>
  );
}
