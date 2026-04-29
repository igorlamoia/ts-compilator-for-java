import type {
  IDEBooleanLiteralMap,
  IDEOperatorWordMap,
} from "@/entities/compiler-config";
import {
  KeywordReferenceTable,
  type KeywordReference,
} from "./components/keyword-reference-table";

export type RulesStepProps = {
  values: {
    booleanLiterals: Array<{
      key: keyof IDEBooleanLiteralMap;
      label: string;
      value: string;
      description: string;
    }>;
    operatorAliases: Array<{
      key: keyof IDEOperatorWordMap;
      label: string;
      value: string;
      description: string;
      placeholder: string;
    }>;
  };
  errors: {
    booleanLiteral: string | null;
    operator: string | null;
  };
  actions: {
    syncBooleanLiteral: (
      field: keyof IDEBooleanLiteralMap,
      value: string,
    ) => void;
    syncOperatorAlias: (field: keyof IDEOperatorWordMap, value: string) => void;
    syncBooleanLiteralDescription: (
      field: keyof IDEBooleanLiteralMap,
      value: string,
    ) => void;
    syncOperatorAliasDescription: (
      field: keyof IDEOperatorWordMap,
      value: string,
    ) => void;
  };
};

type BooleanLiteralField = RulesStepProps["values"]["booleanLiterals"][number];
type OperatorAliasField = RulesStepProps["values"]["operatorAliases"][number];
type RuleAliasField = BooleanLiteralField | OperatorAliasField;

const BOOLEAN_REFERENCE_META: Record<
  keyof IDEBooleanLiteralMap,
  KeywordReference
> = {
  true: {
    glyph: "T",
    label: "TRUE",
    className: "text-emerald-300 shadow-[0_0_20px_-8px_rgba(110,231,183,0.9)]",
  },
  false: {
    glyph: "F",
    label: "FALSE",
    className: "text-rose-300 shadow-[0_0_20px_-8px_rgba(253,164,175,0.9)]",
  },
};

const OPERATOR_REFERENCE_META: Partial<
  Record<keyof IDEOperatorWordMap, string>
> = {
  logical_or: "text-cyan-300 shadow-[0_0_20px_-8px_rgba(34,211,238,0.95)]",
  logical_and: "text-cyan-300 shadow-[0_0_20px_-8px_rgba(34,211,238,0.95)]",
  logical_not: "text-amber-300 shadow-[0_0_20px_-8px_rgba(251,191,36,0.9)]",
  equal_equal: "text-violet-300 shadow-[0_0_20px_-8px_rgba(196,181,253,0.9)]",
  not_equal: "text-pink-400 shadow-[0_0_20px_-8px_rgba(244,114,182,0.9)]",
};

function getRuleReference(field: RuleAliasField): KeywordReference {
  if (field.key === "true" || field.key === "false") {
    return BOOLEAN_REFERENCE_META[field.key];
  }

  return {
    glyph: "placeholder" in field ? field.placeholder : field.label,
    label: field.label,
    className:
      OPERATOR_REFERENCE_META[field.key] ??
      "text-slate-300 shadow-[0_0_20px_-8px_rgba(148,163,184,0.75)]",
  };
}

export function RulesStep({ values, errors, actions }: RulesStepProps) {
  return (
    <section className="space-y-6">
      <header className="space-y-2">
        <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-slate-500 dark:text-slate-400">
          Etapa 4
        </p>
        <h3 className="text-xl font-semibold text-slate-900 dark:text-slate-100">
          Regras
        </h3>
        <p className="max-w-3xl text-sm text-slate-600 dark:text-slate-400">
          Ajuste apenas as regras já suportadas pelo domínio atual.
        </p>
      </header>

      <KeywordReferenceTable
        title="Literais booleanos"
        items={values.booleanLiterals.map((field) => ({
          id: field.key,
          value: field.value,
          description: field.description,
          reference: getRuleReference(field),
          editLabel: field.label,
        }))}
        onValueChange={(field, value) => actions.syncBooleanLiteral(field, value)}
        onDescriptionChange={(field, value) =>
          actions.syncBooleanLiteralDescription(field, value)
        }
      />

      {errors.booleanLiteral && (
        <p className="text-sm text-red-600 dark:text-red-300">
          {errors.booleanLiteral}
        </p>
      )}

      <KeywordReferenceTable
        title="Aliases de operadores"
        items={values.operatorAliases.map((field) => ({
          id: field.key,
          value: field.value,
          description: field.description,
          reference: getRuleReference(field),
          editLabel: field.label,
          placeholder: field.placeholder,
        }))}
        onValueChange={(field, value) => actions.syncOperatorAlias(field, value)}
        onDescriptionChange={(field, value) =>
          actions.syncOperatorAliasDescription(field, value)
        }
      />

      {errors.operator && (
        <p className="text-sm text-red-600 dark:text-red-300">
          {errors.operator}
        </p>
      )}
    </section>
  );
}
