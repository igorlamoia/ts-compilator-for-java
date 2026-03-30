import type { StoredKeywordCustomization } from "@/contexts/keyword/types";
import { TypingRelationshipBeam } from "./components/typing-relationship-beam";
import { ExampleSnippet } from "../example-snippet";
import { DocumentedField } from "../documented-field";
import { OptionCard } from "../option-card";
import { BicepsFlexed, Sparkles, WandSparkles } from "lucide-react";

export type VariableStepKeyword =
  | "print"
  | "scan"
  | "int"
  | "float"
  | "bool"
  | "string"
  | "variavel";

export type VariablesStepProps = {
  values: {
    snippet?: string;
    typingMode: StoredKeywordCustomization["modes"]["typing"];
    arrayMode: StoredKeywordCustomization["modes"]["array"];
    printKeyword: string;
    printDescription: string;
    scanKeyword: string;
    scanDescription: string;
    typingBeamKeywords: {
      variavel: string;
      string: string;
      float: string;
      int: string;
      void: string;
    };
    variableKeywords: Array<{
      key: Exclude<VariableStepKeyword, "print" | "scan">;
      value: string;
      description: string;
    }>;
  };
  actions: {
    syncTypingMode: (mode: "typed" | "untyped") => void;
    syncArrayMode: (mode: "fixed" | "dynamic") => void;
    syncKeyword: (original: VariableStepKeyword, value: string) => void;
    syncKeywordDescription: (
      original: VariableStepKeyword,
      value: string,
    ) => void;
  };
};

export function VariablesStep({ values, actions }: VariablesStepProps) {
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
          value={values.printKeyword}
          description={values.printDescription}
          onValueChange={(value) => actions.syncKeyword("print", value)}
          onDescriptionChange={(value) =>
            actions.syncKeywordDescription("print", value)
          }
        />

        <DocumentedField
          label="Palavra de leitura"
          value={values.scanKeyword}
          description={values.scanDescription}
          onValueChange={(value) => actions.syncKeyword("scan", value)}
          onDescriptionChange={(value) =>
            actions.syncKeywordDescription("scan", value)
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
            title="Não tipado"
            subtitle="Dureza"
            description="Mostra só uma palavra genérica para declarar variáveis."
            snippet='variavel nome = "Ana"'
            selected={values.typingMode === "untyped"}
            onClick={() => actions.syncTypingMode("untyped")}
            icon={<BicepsFlexed className="h-5 w-5 text-cyan-300" />}
          />
          <OptionCard
            title="Tipado"
            subtitle="Magico"
            description="Libera palavras específicas para int, float, bool e string."
            snippet='string nome = "Ana"'
            selected={values.typingMode === "typed"}
            onClick={() => actions.syncTypingMode("typed")}
            icon={<WandSparkles className="h-5 w-5 text-cyan-300" />}
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
            "rounded-2xl border px-4 py-3 text-left transition-colors",
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
            "rounded-2xl border px-4 py-3 text-left transition-colors",
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
