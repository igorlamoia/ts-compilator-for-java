import type { StoredKeywordCustomization } from "@/contexts/keyword/types";
import { ExampleSnippet } from "../example-snippet";
import { DocumentedField } from "../documented-field";
import { OptionCard } from "../option-card";

export type StructureStepProps = {
  draftCustomization: StoredKeywordCustomization;
  snippet?: string;
  delimiterError: string | null;
  statementTerminatorError: string | null;
  onBlockModeChange: (mode: "delimited" | "indentation") => void;
  onDelimiterChange: (field: "open" | "close", value: string) => void;
  onDelimiterDescriptionChange: (
    field: "open" | "close",
    value: string,
  ) => void;
  onStatementTerminatorChange: (value: string) => void;
  onStatementTerminatorDescriptionChange: (value: string) => void;
  onSemicolonModeChange: (mode: "optional-eol" | "required") => void;
};

export function StructureStep({
  draftCustomization,
  snippet,
  delimiterError,
  statementTerminatorError,
  onBlockModeChange,
  onDelimiterChange,
  onDelimiterDescriptionChange,
  onStatementTerminatorChange,
  onStatementTerminatorDescriptionChange,
  onSemicolonModeChange,
}: StructureStepProps) {
  const usesCustomDelimiters =
    draftCustomization.blockDelimiters.open.trim().length > 0 ||
    draftCustomization.blockDelimiters.close.trim().length > 0;

  return (
    <section className="space-y-6">
      <header className="space-y-2">
        <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-slate-500 dark:text-slate-400">
          Etapa 3
        </p>
        <h3 className="text-xl font-semibold text-slate-900 dark:text-slate-100">
          Estrutura
        </h3>
        <p className="max-w-2xl text-sm text-slate-600 dark:text-slate-400">
          Configure blocos, delimitadores e como cada instrução termina.
        </p>
      </header>

      <div className="grid gap-3 sm:grid-cols-2">
        <button
          type="button"
          onClick={() => onSemicolonModeChange("optional-eol")}
          className={[
            "rounded-2xl border px-4 py-3 text-left transition-colors",
            draftCustomization.modes.semicolon === "optional-eol"
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
          onClick={() => onSemicolonModeChange("required")}
          className={[
            "rounded-2xl border px-4 py-3 text-left transition-colors",
            draftCustomization.modes.semicolon === "required"
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
          value={draftCustomization.statementTerminatorLexeme}
          description={
            draftCustomization.languageDocumentation["terminator.statement"]
              ?.description ?? ""
          }
          onValueChange={onStatementTerminatorChange}
          onDescriptionChange={onStatementTerminatorDescriptionChange}
          placeholder="Opcional"
        />
        {statementTerminatorError && (
          <span className="text-sm text-red-600 dark:text-red-300">
            {statementTerminatorError}
          </span>
        )}
      </div>

      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
        <OptionCard
          title="Chaves"
          description="Mantém a estrutura delimitada por símbolos tradicionais."
          snippet={"if (condicao) {\n  escreva(\"ok\")\n}"}
          selected={
            draftCustomization.modes.block === "delimited" &&
            !usesCustomDelimiters
          }
          onClick={() => onBlockModeChange("delimited")}
        />
        <OptionCard
          title="Início / fim"
          description="Usa palavras para abrir e fechar blocos delimitados."
          snippet={"se (condicao) inicio\n  escreva(\"ok\")\nfim"}
          selected={
            draftCustomization.modes.block === "delimited" &&
            usesCustomDelimiters
          }
          onClick={() => onBlockModeChange("delimited")}
        />
        <OptionCard
          title="Indentação"
          description="Organiza blocos pela indentação, sem delimitadores."
          snippet={"se (condicao):\n  escreva(\"ok\")"}
          selected={draftCustomization.modes.block === "indentation"}
          onClick={() => onBlockModeChange("indentation")}
        />
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <DocumentedField
          label="Delimitador de abertura"
          value={draftCustomization.blockDelimiters.open}
          description={
            draftCustomization.languageDocumentation["delimiter.open"]
              ?.description ?? ""
          }
          onValueChange={(value) => onDelimiterChange("open", value)}
          onDescriptionChange={(value) =>
            onDelimiterDescriptionChange("open", value)
          }
          disabled={draftCustomization.modes.block === "indentation"}
          placeholder="begin"
        />

        <DocumentedField
          label="Delimitador de fechamento"
          value={draftCustomization.blockDelimiters.close}
          description={
            draftCustomization.languageDocumentation["delimiter.close"]
              ?.description ?? ""
          }
          onValueChange={(value) => onDelimiterChange("close", value)}
          onDescriptionChange={(value) =>
            onDelimiterDescriptionChange("close", value)
          }
          disabled={draftCustomization.modes.block === "indentation"}
          placeholder="end"
        />
      </div>

      {draftCustomization.modes.block === "delimited" && delimiterError && (
        <p className="text-sm text-red-600 dark:text-red-300">{delimiterError}</p>
      )}

      <ExampleSnippet
        title="Exemplo estrutural"
        code={snippet ?? "if (condicao) {\n  print(\"ok\")\n}"}
      />
    </section>
  );
}
