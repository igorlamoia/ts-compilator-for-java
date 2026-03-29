import type {
  IDEBooleanLiteralMap,
  IDEOperatorWordMap,
} from "@/entities/compiler-config";
import type { StoredKeywordCustomization } from "@/contexts/keyword/types";
import {
  getBooleanDocumentationId,
  getOperatorDocumentationId,
} from "@/lib/language-documentation";
import { OPERATOR_WORD_FIELDS } from "@/lib/operator-word-map";
import { DocumentedField } from "../documented-field";

export type RulesStepProps = {
  draftCustomization: StoredKeywordCustomization;
  booleanLiteralError: string | null;
  operatorError: string | null;
  onBooleanLiteralChange: (
    field: keyof IDEBooleanLiteralMap,
    value: string,
  ) => void;
  onOperatorAliasChange: (field: keyof IDEOperatorWordMap, value: string) => void;
  onBooleanLiteralDescriptionChange: (
    field: keyof IDEBooleanLiteralMap,
    value: string,
  ) => void;
  onOperatorAliasDescriptionChange: (
    field: keyof IDEOperatorWordMap,
    value: string,
  ) => void;
};

export function RulesStep({
  draftCustomization,
  booleanLiteralError,
  operatorError,
  onBooleanLiteralChange,
  onOperatorAliasChange,
  onBooleanLiteralDescriptionChange,
  onOperatorAliasDescriptionChange,
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
          <DocumentedField
            key={field}
            label={`Literal ${field}`}
            value={draftCustomization.booleanLiteralMap[field] ?? ""}
            description={
              draftCustomization.languageDocumentation[
                getBooleanDocumentationId(field)
              ]?.description ?? ""
            }
            onValueChange={(value) => onBooleanLiteralChange(field, value)}
            onDescriptionChange={(value) =>
              onBooleanLiteralDescriptionChange(field, value)
            }
          />
        ))}
      </div>

      {booleanLiteralError && (
        <p className="text-sm text-red-600 dark:text-red-300">
          {booleanLiteralError}
        </p>
      )}

      <div className="grid gap-3 md:grid-cols-2">
        {OPERATOR_WORD_FIELDS.map((field) => (
          <DocumentedField
            key={field.key}
            label={field.label}
            value={draftCustomization.operatorWordMap[field.key] ?? ""}
            description={
              draftCustomization.languageDocumentation[
                getOperatorDocumentationId(field.key)
              ]?.description ?? ""
            }
            onValueChange={(value) => onOperatorAliasChange(field.key, value)}
            onDescriptionChange={(value) =>
              onOperatorAliasDescriptionChange(field.key, value)
            }
            placeholder={field.symbol}
          />
        ))}
      </div>

      {operatorError && (
        <p className="text-sm text-red-600 dark:text-red-300">{operatorError}</p>
      )}
    </section>
  );
}
