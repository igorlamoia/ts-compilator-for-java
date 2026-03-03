import type { TTestCaseResult } from "@/pages/api/submissions/validate";

type Props = {
  results: TTestCaseResult[];
  passed: number;
  total: number;
};

export function TestCaseResults({ results, passed, total }: Props) {
  const allPassed = passed === total;

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h4 className="text-sm font-bold text-slate-200">
          Casos de Teste
        </h4>
        <span
          className={`text-xs font-bold px-2.5 py-1 rounded-lg ${
            allPassed
              ? "bg-emerald-500/20 text-emerald-300"
              : "bg-red-500/20 text-red-300"
          }`}
        >
          {passed}/{total} passaram
        </span>
      </div>

      {results.map((tc, i) => (
        <div
          key={i}
          className={`border rounded-xl overflow-hidden ${
            tc.passed
              ? "border-emerald-500/20 bg-emerald-500/5"
              : "border-red-500/20 bg-red-500/5"
          }`}
        >
          <div className="flex items-center gap-2 px-4 py-2 border-b border-white/5">
            <span
              className={`text-xs font-bold px-2 py-0.5 rounded ${
                tc.passed
                  ? "bg-emerald-500/20 text-emerald-300"
                  : "bg-red-500/20 text-red-300"
              }`}
            >
              {tc.passed ? "PASSED" : "FAILED"}
            </span>
            <span className="text-xs text-slate-300 font-medium">
              {tc.label}
            </span>
          </div>

          <div className="p-3 space-y-2">
            {tc.input && (
              <div>
                <span className="text-xs text-slate-500 font-medium">
                  Entrada:
                </span>
                <pre className="mt-1 text-xs font-mono text-slate-300 bg-black/20 px-3 py-2 rounded whitespace-pre-wrap">
                  {tc.input}
                </pre>
              </div>
            )}

            <div className="grid grid-cols-2 gap-3">
              <div>
                <span className="text-xs text-slate-500 font-medium">
                  Saída Esperada:
                </span>
                <pre className="mt-1 text-xs font-mono text-slate-300 bg-black/20 px-3 py-2 rounded whitespace-pre-wrap">
                  {tc.expectedOutput || "(vazio)"}
                </pre>
              </div>
              <div>
                <span className="text-xs text-slate-500 font-medium">
                  Saída Real:
                </span>
                <pre
                  className={`mt-1 text-xs font-mono px-3 py-2 rounded whitespace-pre-wrap ${
                    tc.passed
                      ? "text-emerald-300 bg-emerald-500/10"
                      : "text-red-300 bg-red-500/10"
                  }`}
                >
                  {tc.actualOutput || "(vazio)"}
                </pre>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
