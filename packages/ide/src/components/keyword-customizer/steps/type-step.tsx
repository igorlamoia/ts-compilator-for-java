import { BicepsFlexed, WandSparkles } from "lucide-react";
import { OptionCard } from "../option-card";
import {
  KeywordReferenceTable,
  type KeywordReference,
} from "./components/keyword-reference-table";
import { TypingRelationshipBeam } from "./components/typing-relationship-beam";
import type { VariablesStepProps } from "./io-step";
import { ExampleSnippet } from "../example-snippet";

type TypeKeywordField =
  VariablesStepProps["values"]["variableKeywords"][number];

const TYPE_REFERENCE_META: Partial<Record<string, KeywordReference>> = {
  variavel: {
    glyph: "x",
    label: "VARIAVEL",
    className: "text-amber-300 shadow-[0_0_20px_-8px_rgba(251,191,36,0.9)]",
  },
  void: {
    glyph: "∅",
    label: "VOID",
    className: "text-slate-400 shadow-[0_0_20px_-8px_rgba(148,163,184,0.9)]",
  },
  funcao: {
    glyph: "ƒ",
    label: "FUNCAO",
    className: "text-green-300 shadow-[0_0_20px_-8px_rgba(132,204,22,0.9)]",
  },
  int: {
    glyph: "1",
    label: "INT",
    className: "text-cyan-300 shadow-[0_0_20px_-8px_rgba(34,211,238,0.95)]",
  },
  float: {
    glyph: "1.1",
    label: "FLOAT",
    className: "text-cyan-300 shadow-[0_0_20px_-8px_rgba(34,211,238,0.95)]",
  },
  bool: {
    glyph: "↔",
    label: "BOOL",
    className: "text-pink-400 shadow-[0_0_20px_-8px_rgba(244,114,182,0.9)]",
  },
  string: {
    glyph: '""',
    label: "STRING",
    className: "text-violet-300 shadow-[0_0_20px_-8px_rgba(196,181,253,0.9)]",
  },
};

function getTypeReference(fieldKey: TypeKeywordField["key"]): KeywordReference {
  return (
    TYPE_REFERENCE_META[fieldKey] ?? {
      glyph: fieldKey.slice(0, 2).toUpperCase(),
      label: fieldKey.toUpperCase(),
    }
  );
}

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
        <TypingRelationshipBeam
          typingMode={values.typingMode}
          labels={values.typingBeamKeywords}
        />
        <div className="grid gap-3 sm:grid-cols-2">
          <OptionCard
            title="Não tipado"
            subtitle="Magico"
            description="Mostra só uma palavra genérica para declarar variáveis."
            selected={values.typingMode === "untyped"}
            onClick={() => actions.syncTypingMode("untyped")}
            icon={<WandSparkles className="h-5 w-5 text-cyan-300" />}
          >
            <ExampleSnippet showHeader={false} code={values.untypedSnippet} />
          </OptionCard>
          <OptionCard
            title="Tipado"
            subtitle="Dureza"
            description="Libera palavras específicas para int, float, bool e string."
            selected={values.typingMode === "typed"}
            onClick={() => actions.syncTypingMode("typed")}
            icon={<BicepsFlexed className="h-5 w-5 text-cyan-300" />}
          >
            <ExampleSnippet showHeader={false} code={values.typedSnippet} />
          </OptionCard>
        </div>
      </div>

      <KeywordReferenceTable
        items={values.variableKeywords.map((field) => ({
          id: field.key,
          value: field.value,
          description: field.description,
          reference: getTypeReference(field.key),
        }))}
        onValueChange={(field, value) => actions.syncKeyword(field, value)}
        onDescriptionChange={(field, value) =>
          actions.syncKeywordDescription(field, value)
        }
      />
      <ExampleSnippet
        title="Exemplo ao vivo"
        code={values.snippet ?? `${values.printKeyword}("Ola mundo")`}
      />
    </section>
  );
}
