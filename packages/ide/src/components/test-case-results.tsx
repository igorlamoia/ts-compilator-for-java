import { useState } from "react";
import type { TTestCaseResult } from "@/pages/api/submissions/validate";
import { OutputComparison } from "@/components/ui/output-comparison";

type Props = {
  results: TTestCaseResult[];
  passed: number;
  total: number;
};

export function TestCaseResults({ results, passed, total }: Props) {
  const allPassed = passed === total;
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const toggle = (i: number) => setOpenIndex(openIndex === i ? null : i);

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between mb-1">
        <h4 className="text-sm font-bold text-slate-200">Casos de Teste</h4>
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

      {results.map((tc, i) => {
        const isOpen = openIndex === i;
        return (
          <div
            key={i}
            className={`border rounded-xl overflow-hidden transition-colors ${
              tc.passed
                ? "border-emerald-500/20 bg-emerald-500/5"
                : "border-red-500/20 bg-red-500/5"
            }`}
          >
            {/* Accordion header — always visible, click to toggle */}
            <button
              type="button"
              onClick={() => toggle(i)}
              className="w-full flex items-center gap-2 px-4 py-2 hover:bg-white/5 transition-colors text-left"
            >
              <span
                className={`text-xs font-bold px-2 py-0.5 rounded ${
                  tc.passed
                    ? "bg-emerald-500/20 text-emerald-300"
                    : "bg-red-500/20 text-red-300"
                }`}
              >
                {tc.passed ? "PASSED" : "FAILED"}
              </span>
              <span className="text-xs text-slate-300 font-medium flex-1">
                {tc.label}
              </span>
              {/* Chevron */}
              <svg
                className={`w-3.5 h-3.5 text-slate-500 transition-transform duration-200 ${
                  isOpen ? "rotate-180" : ""
                }`}
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth={2.5}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M19 9l-7 7-7-7"
                />
              </svg>
            </button>

            {/* Accordion body */}
            {isOpen && (
              <div className="p-3 space-y-2 border-t border-white/5">
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

                <OutputComparison
                  expectedOutput={tc.expectedOutput ?? ""}
                  actualOutput={tc.actualOutput ?? ""}
                  passed={tc.passed}
                />
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
