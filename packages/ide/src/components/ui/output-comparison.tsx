"use client";

import { cn } from "@/lib/utils";

type DiffLine =
  | { type: "equal"; line: string }
  | { type: "remove"; line: string } // in expected, missing in actual
  | { type: "add"; line: string }; // in actual, not in expected

function computeDiff(expected: string, actual: string): DiffLine[] {
  const a = expected.split("\n");
  const b = actual.split("\n");
  const m = a.length;
  const n = b.length;

  // LCS DP table
  const dp: number[][] = Array.from({ length: m + 1 }, () =>
    new Array(n + 1).fill(0)
  );
  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      dp[i][j] =
        a[i - 1] === b[j - 1]
          ? dp[i - 1][j - 1] + 1
          : Math.max(dp[i - 1][j], dp[i][j - 1]);
    }
  }

  // Backtrack to build diff
  const result: DiffLine[] = [];
  let i = m,
    j = n;
  while (i > 0 || j > 0) {
    if (i > 0 && j > 0 && a[i - 1] === b[j - 1]) {
      result.unshift({ type: "equal", line: a[i - 1] });
      i--;
      j--;
    } else if (j > 0 && (i === 0 || dp[i][j - 1] >= dp[i - 1][j])) {
      result.unshift({ type: "add", line: b[j - 1] });
      j--;
    } else {
      result.unshift({ type: "remove", line: a[i - 1] });
      i--;
    }
  }

  return result;
}

interface OutputComparisonProps {
  expectedOutput: string;
  actualOutput: string;
  passed: boolean;
  className?: string;
}

export function OutputComparison({
  expectedOutput,
  actualOutput,
  passed,
  className,
}: OutputComparisonProps) {
  const diff = computeDiff(expectedOutput || "(vazio)", actualOutput || "(vazio)");

  return (
    <div
      className={cn(
        "w-full overflow-hidden rounded-lg border border-white/10 font-mono text-xs",
        className
      )}
    >
      {/* Header — mimics git diff header */}
      <div className="flex items-center justify-between border-b border-white/10 bg-white/[0.04] px-3 py-1.5">
        <div className="flex items-center gap-3 text-[10px] uppercase tracking-widest">
          <span className="text-emerald-400/70">
            <span className="font-bold mr-1">−</span>esperada
          </span>
          <span className="text-slate-600">·</span>
          <span className="text-red-400/70">
            <span className="font-bold mr-1">+</span>real
          </span>
        </div>
        <span
          className={cn(
            "text-[9px] font-bold uppercase tracking-widest px-2 py-0.5 rounded",
            passed
              ? "text-emerald-400 bg-emerald-500/10"
              : "text-red-400 bg-red-500/10"
          )}
        >
          {passed ? "idêntico" : "diferente"}
        </span>
      </div>

      {/* Diff body */}
      <div className="bg-[#0d1117]">
        {diff.map((entry, idx) => (
          <div
            key={idx}
            className={cn(
              "flex items-start leading-5",
              entry.type === "remove" && "bg-emerald-500/10",
              entry.type === "add" && "bg-red-500/10"
            )}
          >
            {/* Sign gutter */}
            <span
              className={cn(
                "w-6 shrink-0 select-none border-r py-0.5 text-center text-[11px]",
                entry.type === "remove" &&
                  "border-emerald-500/20 bg-emerald-500/20 text-emerald-400",
                entry.type === "add" &&
                  "border-red-500/20 bg-red-500/20 text-red-400",
                entry.type === "equal" &&
                  "border-white/5 bg-transparent text-slate-700"
              )}
            >
              {entry.type === "remove" ? "−" : entry.type === "add" ? "+" : " "}
            </span>

            {/* Line content */}
            <span
              className={cn(
                "px-3 py-0.5 whitespace-pre-wrap break-all",
                entry.type === "remove" && "text-emerald-300",
                entry.type === "add" && "text-red-300",
                entry.type === "equal" && "text-slate-500"
              )}
            >
              {entry.line}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
