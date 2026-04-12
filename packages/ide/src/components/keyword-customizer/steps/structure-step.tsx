import type { StoredKeywordCustomization } from "@/contexts/keyword/types";
import { ExampleSnippet } from "../example-snippet";
import { DocumentedField } from "../documented-field";
import { OptionCard } from "../option-card";

export type StructureStepProps = {
  values: {
    snippet?: string;
    delimiterSnippet: string;
    identationSnippet: string;
    semicolonMode: StoredKeywordCustomization["modes"]["semicolon"];
    blockMode: StoredKeywordCustomization["modes"]["block"];
    usesCustomDelimiters: boolean;
    statementTerminator: {
      value: string;
      description: string;
    };
    keywords: Array<{
      key: "void" | "funcao";
      value: string;
      description: string;
    }>;
    delimiters: {
      open: {
        value: string;
        description: string;
      };
      close: {
        value: string;
        description: string;
      };
    };
  };
  errors: {
    delimiter: string | null;
    statementTerminator: string | null;
  };
  actions: {
    syncBlockMode: (mode: "delimited" | "indentation") => void;
    syncDelimiter: (field: "open" | "close", value: string) => void;
    syncDelimiterDescription: (field: "open" | "close", value: string) => void;
    syncStatementTerminator: (value: string) => void;
    syncStatementTerminatorDescription: (value: string) => void;
    syncSemicolonMode: (mode: "optional-eol" | "required") => void;
    syncKeyword: (original: "void" | "funcao", value: string) => void;
    syncKeywordDescription: (
      original: "void" | "funcao",
      value: string,
    ) => void;
  };
};

export function StructureStep({ values, errors, actions }: StructureStepProps) {
  return (
    <section className="space-y-6">
      <header className="space-y-2">
        <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-slate-500 dark:text-slate-400">
          Etapa 3
        </p>
        <h3 className="text-xl font-semibold text-slate-900 dark:text-slate-100">
          Estrutura
        </h3>
        <p className="max-w-3xl text-sm text-slate-600 dark:text-slate-400">
          Configure blocos, delimitadores e como cada instrução termina.
        </p>
      </header>

      <div className="grid gap-3 sm:grid-cols-2">
        <button
          type="button"
          onClick={() => actions.syncSemicolonMode("optional-eol")}
          className={[
            "rounded-lg border px-4 py-3 text-left transition-colors",
            values.semicolonMode === "optional-eol"
              ? "border-cyan-500 bg-cyan-50 dark:border-cyan-400 dark:bg-cyan-950/40"
              : "border-slate-200/80 bg-white/80 dark:border-slate-800/80 dark:bg-slate-900/80",
          ].join(" ")}
        >
          <span className="block text-sm font-semibold text-slate-900 dark:text-slate-100">
            Sem ponto e vírgula
          </span>
          <span className="block text-xs text-slate-500 dark:text-slate-400">
            A instrução termina no fim da linha.
          </span>
        </button>

        <button
          type="button"
          onClick={() => actions.syncSemicolonMode("required")}
          className={[
            "rounded-lg border px-4 py-3 text-left transition-colors",
            values.semicolonMode === "required"
              ? "border-cyan-500 bg-cyan-50 dark:border-cyan-400 dark:bg-cyan-950/40"
              : "border-slate-200/80 bg-white/80 dark:border-slate-800/80 dark:bg-slate-900/80",
          ].join(" ")}
        >
          <span className="block text-sm font-semibold text-slate-900 dark:text-slate-100">
            Exigir ponto e vírgula
          </span>
          <span className="block text-xs text-slate-500 dark:text-slate-400">
            Mantém o terminador explícito.
          </span>
        </button>
      </div>

      <div className="space-y-2">
        <DocumentedField
          label="Terminador customizado"
          value={values.statementTerminator.value}
          description={values.statementTerminator.description}
          onValueChange={actions.syncStatementTerminator}
          onDescriptionChange={actions.syncStatementTerminatorDescription}
          placeholder="Opcional"
        />
        {errors.statementTerminator && (
          <span className="text-sm text-red-600 dark:text-red-300">
            {errors.statementTerminator}
          </span>
        )}
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {values.keywords.map((field) => (
          <DocumentedField
            key={field.key}
            label={field.key}
            value={field.value}
            description={field.description}
            onValueChange={(value) => actions.syncKeyword(field.key, value)}
            onDescriptionChange={(value) =>
              actions.syncKeywordDescription(field.key, value)
            }
          />
        ))}
      </div>

      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
        <OptionCard
          title="Chaves"
          description="Mantém a estrutura delimitada por símbolos tradicionais."
          selected={values.blockMode === "delimited"}
          onClick={() => actions.syncBlockMode("delimited")}
        >
          <ExampleSnippet showHeader={false} code={values.delimiterSnippet} />
        </OptionCard>
        <OptionCard
          title="Indentação"
          description="Organiza blocos pela indentação, sem delimitadores."
          selected={values.blockMode === "indentation"}
          onClick={() => actions.syncBlockMode("indentation")}
        >
          <ExampleSnippet showHeader={false} code={values.identationSnippet} />
        </OptionCard>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <DocumentedField
          label="Delimitador de abertura"
          value={values.delimiters.open.value}
          description={values.delimiters.open.description}
          onValueChange={(value) => actions.syncDelimiter("open", value)}
          onDescriptionChange={(value) =>
            actions.syncDelimiterDescription("open", value)
          }
          disabled={values.blockMode === "indentation"}
          placeholder="begin"
        />

        <DocumentedField
          label="Delimitador de fechamento"
          value={values.delimiters.close.value}
          description={values.delimiters.close.description}
          onValueChange={(value) => actions.syncDelimiter("close", value)}
          onDescriptionChange={(value) =>
            actions.syncDelimiterDescription("close", value)
          }
          disabled={values.blockMode === "indentation"}
          placeholder="end"
        />
      </div>

      {values.blockMode === "delimited" && errors.delimiter && (
        <p className="text-sm text-red-600 dark:text-red-300">
          {errors.delimiter}
        </p>
      )}

      <ExampleSnippet
        title="Exemplo estrutural"
        code={values.snippet ?? 'if (condicao) {\n  print("ok")\n}'}
      />
    </section>
  );
}
