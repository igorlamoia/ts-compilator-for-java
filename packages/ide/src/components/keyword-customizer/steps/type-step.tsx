import { BicepsFlexed, WandSparkles } from "lucide-react";
import { OptionCard } from "../option-card";
import { TypingRelationshipBeam } from "./components/typing-relationship-beam";
import { VariablesStepProps } from "./io-step";
import { DocumentedField } from "../documented-field";
import { ExampleSnippet } from "../example-snippet";

export function TypeStep({ values, actions }: VariablesStepProps) {
  return (
    <section className="space-y-6">
      <header className="space-y-2">
        <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-slate-500 dark:text-slate-400">
          Etapa 2
        </p>
        <h3 className="text-xl font-semibold text-slate-900 dark:text-slate-100">
          Modelo de tipagem
        </h3>
        <p className="max-w-3xl text-sm text-slate-600 dark:text-slate-400">
          Escolha primeiro se a linguagem será tipada ou não tipada.
        </p>
      </header>
      <div className="space-y-3">
        <div className="grid gap-3 sm:grid-cols-2">
          <OptionCard
            title="Não tipado"
            subtitle="Magico"
            description="Mostra só uma palavra genérica para declarar variáveis."
            snippet='variavel nome = "Ana"'
            selected={values.typingMode === "untyped"}
            onClick={() => actions.syncTypingMode("untyped")}
            icon={<WandSparkles className="h-5 w-5 text-cyan-300" />}
          />
          <OptionCard
            title="Tipado"
            subtitle="Dureza"
            description="Libera palavras específicas para int, float, bool e string."
            snippet='string nome = "Ana"'
            selected={values.typingMode === "typed"}
            onClick={() => actions.syncTypingMode("typed")}
            icon={<BicepsFlexed className="h-5 w-5 text-cyan-300" />}
          />
        </div>

        <TypingRelationshipBeam
          typingMode={values.typingMode}
          labels={values.typingBeamKeywords}
        />
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {values.variableKeywords.map((field) => (
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

      <div className="grid gap-3 sm:grid-cols-2">
        <button
          type="button"
          onClick={() => actions.syncArrayMode("fixed")}
          className={[
            "rounded-lg border px-4 py-3 text-left transition-colors",
            values.arrayMode === "fixed"
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
          onClick={() => actions.syncArrayMode("dynamic")}
          className={[
            "rounded-lg border px-4 py-3 text-left transition-colors",
            values.arrayMode === "dynamic"
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
        code={values.snippet ?? `${values.printKeyword}("Ola mundo")`}
      />
    </section>
  );
}
