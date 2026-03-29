import { Input } from "@/components/ui/input";
import type {
  IDEBooleanLiteralMap,
  IDEOperatorWordMap,
} from "@/entities/compiler-config";
import type { StoredKeywordCustomization } from "@/contexts/keyword/types";
import { OPERATOR_WORD_FIELDS } from "@/lib/operator-word-map";

export type RulesStepProps = {
  draftCustomization: StoredKeywordCustomization;
  booleanLiteralError: string | null;
  operatorError: string | null;
  onBooleanLiteralChange: (
    field: keyof IDEBooleanLiteralMap,
    value: string,
  ) => void;
  onOperatorAliasChange: (field: keyof IDEOperatorWordMap, value: string) => void;
};

export function RulesStep({
  draftCustomization,
  booleanLiteralError,
  operatorError,
  onBooleanLiteralChange,
  onOperatorAliasChange,
}: RulesStepProps) {
  return (
    <section className="space-y-6">
      <header className="space-y-2">
        <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-slate-500 dark:text-slate-400">
          Etapa 4
        </p>
        <h3 className="text-xl font-semibold text-slate-900 dark:text-slate-100">
          Regras
        </h3>
        <p className="max-w-2xl text-sm text-slate-600 dark:text-slate-400">
          Ajuste apenas as regras já suportadas pelo domínio atual.
        </p>
      </header>

      <div className="grid gap-3 md:grid-cols-2">
        {(["true", "false"] as const).map((field) => (
          <label
            key={field}
            className="flex flex-col gap-2 rounded-2xl border border-slate-200/80 bg-white/80 p-4 dark:border-slate-800/80 dark:bg-slate-900/80"
          >
            <span className="text-sm font-semibold text-slate-900 dark:text-slate-100">
              Literal {field}
            </span>
            <Input
              value={draftCustomization.booleanLiteralMap[field] ?? ""}
              onChange={(event) =>
                onBooleanLiteralChange(field, event.target.value)
              }
              className="font-mono"
              spellCheck={false}
            />
          </label>
        ))}
      </div>

      {booleanLiteralError && (
        <p className="text-sm text-red-600 dark:text-red-300">
          {booleanLiteralError}
        </p>
      )}

      <div className="grid gap-3 md:grid-cols-2">
        {OPERATOR_WORD_FIELDS.map((field) => (
          <label
            key={field.key}
            className="flex flex-col gap-2 rounded-2xl border border-slate-200/80 bg-white/80 p-4 dark:border-slate-800/80 dark:bg-slate-900/80"
          >
            <span className="text-sm font-semibold text-slate-900 dark:text-slate-100">
              {field.label}
            </span>
            <Input
              value={draftCustomization.operatorWordMap[field.key] ?? ""}
              onChange={(event) =>
                onOperatorAliasChange(field.key, event.target.value)
              }
              placeholder={field.symbol}
              className="font-mono"
              spellCheck={false}
            />
          </label>
        ))}
      </div>

      {operatorError && (
        <p className="text-sm text-red-600 dark:text-red-300">{operatorError}</p>
      )}
    </section>
  );
}
