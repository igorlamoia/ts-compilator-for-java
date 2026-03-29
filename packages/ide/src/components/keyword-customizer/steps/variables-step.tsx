import type { StoredKeywordCustomization } from "@/contexts/keyword/types";
import { getKeywordDocumentationId } from "@/lib/language-documentation";
import { ExampleSnippet } from "../example-snippet";
import { DocumentedField } from "../documented-field";
import { OptionCard } from "../option-card";

export type VariablesStepProps = {
  draftCustomization: StoredKeywordCustomization;
  snippet?: string;
  onTypingModeChange: (mode: "typed" | "untyped") => void;
  onArrayModeChange: (mode: "fixed" | "dynamic") => void;
  onKeywordChange: (
    original:
      | "print"
      | "scan"
      | "int"
      | "float"
      | "bool"
      | "string"
      | "variavel",
    value: string,
  ) => void;
  onKeywordDescriptionChange: (
    original:
      | "print"
      | "scan"
      | "int"
      | "float"
      | "bool"
      | "string"
      | "variavel",
    value: string,
  ) => void;
};

function getKeyword(
  draftCustomization: StoredKeywordCustomization,
  original: string,
) {
  return (
    draftCustomization.mappings.find((item) => item.original === original)
      ?.custom ?? original
  );
}

function getVisibleVariableFields(mode: "typed" | "untyped") {
  if (mode === "untyped") {
    return ["variavel"] as const;
  }

  return ["int", "float", "bool", "string"] as const;
}

export function VariablesStep({
  draftCustomization,
  snippet,
  onTypingModeChange,
  onArrayModeChange,
  onKeywordChange,
  onKeywordDescriptionChange,
}: VariablesStepProps) {
  const printKeyword = getKeyword(draftCustomization, "print");
  const scanKeyword = getKeyword(draftCustomization, "scan");
  const visibleVariableFields = getVisibleVariableFields(
    draftCustomization.modes.typing,
  );

  return (
    <section className="space-y-6">
      <header className="space-y-2">
        <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-slate-500 dark:text-slate-400">
          Etapa 2
        </p>
        <h3 className="text-xl font-semibold text-slate-900 dark:text-slate-100">
          Vocabulário
        </h3>
        <p className="max-w-2xl text-sm text-slate-600 dark:text-slate-400">
          Defina leitura, escrita e o vocabulário usado para declarar variáveis.
        </p>
      </header>

      <div className="grid gap-4 lg:grid-cols-2">
        <DocumentedField
          label="Palavra de saída"
          value={printKeyword}
          description={
            draftCustomization.languageDocumentation[
              getKeywordDocumentationId("print")
            ]?.description ?? ""
          }
          onValueChange={(value) => onKeywordChange("print", value)}
          onDescriptionChange={(value) =>
            onKeywordDescriptionChange("print", value)
          }
        />

        <DocumentedField
          label="Palavra de leitura"
          value={scanKeyword}
          description={
            draftCustomization.languageDocumentation[
              getKeywordDocumentationId("scan")
            ]?.description ?? ""
          }
          onValueChange={(value) => onKeywordChange("scan", value)}
          onDescriptionChange={(value) =>
            onKeywordDescriptionChange("scan", value)
          }
        />
      </div>

      <div className="space-y-3">
        <div className="space-y-1">
          <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">
            Modelo de tipagem
          </p>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Escolha primeiro se a linguagem será tipada ou não tipada.
          </p>
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          <OptionCard
            title="Tipado"
            description="Libera palavras específicas para int, float, bool e string."
            snippet='string nome = "Ana"'
            selected={draftCustomization.modes.typing === "typed"}
            onClick={() => onTypingModeChange("typed")}
          />
          <OptionCard
            title="Não tipado"
            description="Mostra só uma palavra genérica para declarar variáveis."
            snippet='variavel nome = "Ana"'
            selected={draftCustomization.modes.typing === "untyped"}
            onClick={() => onTypingModeChange("untyped")}
          />
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {visibleVariableFields.map((field) => (
          <DocumentedField
            key={field}
            label={field}
            value={
              draftCustomization.mappings.find((item) => item.original === field)
                ?.custom ?? field
            }
            description={
              draftCustomization.languageDocumentation[
                getKeywordDocumentationId(field)
              ]?.description ?? ""
            }
            onValueChange={(value) => onKeywordChange(field, value)}
            onDescriptionChange={(value) =>
              onKeywordDescriptionChange(field, value)
            }
          />
        ))}
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <button
          type="button"
          onClick={() => onArrayModeChange("fixed")}
          className={[
            "rounded-2xl border px-4 py-3 text-left transition-colors",
            draftCustomization.modes.array === "fixed"
              ? "border-cyan-500 bg-cyan-50 dark:border-cyan-400 dark:bg-cyan-950/40"
              : "border-slate-200/80 bg-white/80 dark:border-slate-800/80 dark:bg-slate-900/80",
          ].join(" ")}
        >
          <span className="block text-sm font-semibold text-slate-900 dark:text-slate-100">
            Tamanho fixo
          </span>
          <span className="block text-xs text-slate-500 dark:text-slate-400">
            Mantém o comportamento atual de vetores e matrizes fixas.
          </span>
        </button>

        <button
          type="button"
          onClick={() => onArrayModeChange("dynamic")}
          className={[
            "rounded-2xl border px-4 py-3 text-left transition-colors",
            draftCustomization.modes.array === "dynamic"
              ? "border-cyan-500 bg-cyan-50 dark:border-cyan-400 dark:bg-cyan-950/40"
              : "border-slate-200/80 bg-white/80 dark:border-slate-800/80 dark:bg-slate-900/80",
          ].join(" ")}
        >
          <span className="block text-sm font-semibold text-slate-900 dark:text-slate-100">
            Tamanho dinâmico
          </span>
          <span className="block text-xs text-slate-500 dark:text-slate-400">
            Permite explorar estruturas mais flexíveis.
          </span>
        </button>
      </div>

      <ExampleSnippet
        title="Exemplo ao vivo"
        code={snippet ?? `${printKeyword}("Ola mundo")`}
      />
    </section>
  );
}
