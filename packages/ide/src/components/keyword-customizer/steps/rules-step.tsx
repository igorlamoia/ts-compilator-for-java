import type {
  IDEBooleanLiteralMap,
  IDEOperatorWordMap,
} from "@/entities/compiler-config";
import { DocumentedField } from "../documented-field";

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
    syncOperatorAlias: (
      field: keyof IDEOperatorWordMap,
      value: string,
    ) => void;
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

export function RulesStep({
  values,
  errors,
  actions,
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
        {values.booleanLiterals.map((field) => (
          <DocumentedField
            key={field.key}
            label={field.label}
            value={field.value}
            description={field.description}
            onValueChange={(value) => actions.syncBooleanLiteral(field.key, value)}
            onDescriptionChange={(value) =>
              actions.syncBooleanLiteralDescription(field.key, value)
            }
          />
        ))}
      </div>

      {errors.booleanLiteral && (
        <p className="text-sm text-red-600 dark:text-red-300">
          {errors.booleanLiteral}
        </p>
      )}

      <div className="grid gap-3 md:grid-cols-2">
        {values.operatorAliases.map((field) => (
          <DocumentedField
            key={field.key}
            label={field.label}
            value={field.value}
            description={field.description}
            onValueChange={(value) => actions.syncOperatorAlias(field.key, value)}
            onDescriptionChange={(value) =>
              actions.syncOperatorAliasDescription(field.key, value)
            }
            placeholder={field.placeholder}
          />
        ))}
      </div>

      {errors.operator && (
        <p className="text-sm text-red-600 dark:text-red-300">{errors.operator}</p>
      )}
    </section>
  );
}
