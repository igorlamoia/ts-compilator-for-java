import { Atom, Code, Languages, Sparkles } from "lucide-react";
import { OptionCard, OptionCardIconColor } from "../option-card";
import type { WizardPresetId } from "../wizard-model";

import type { ReactNode } from "react";
export type IdentityStepProps = {
  values: {
    selectedPresetId: WizardPresetId;
  };
  actions: {
    selectPreset: (presetId: WizardPresetId) => void;
  };
};

const PRESET_OPTIONS: Array<{
  id: WizardPresetId;
  title: string;
  subtitle: string;
  description: string;
  snippet: string;
  icon: ReactNode;
  iconColor?: OptionCardIconColor;
}> = [
  {
    id: "free",
    title: "Livre",
    subtitle: "CUSTOM DNA",
    description: "Deixa a configuração manual começar sem sugestão fixa.",
    snippet: 'diga("Olá mundo")',
    icon: <Atom className="h-5 w-5" />,
    iconColor: "cyan",
  },
  {
    id: "didactic-pt",
    title: "Didatica em Portugues",
    subtitle: "PT-BR LOGIC",
    description: "Traz o vocabulário de controle, tipos e blocos para português.",
    snippet: 'inicio\n  escreva("Olá mundo")\nfim',
    icon: <Languages className="h-5 w-5" />,
    iconColor: "violet",
  },
  {
    id: "minimal",
    title: "Minimalista",
    subtitle: "ZERO SURFACE",
    description: "Mantém todos os comandos visíveis, mas com aliases curtos.",
    snippet: 'out("Olá mundo").',
    icon: <Code className="h-5 w-5" />,
    iconColor: "emerald",
  },
  {
    id: "python-like",
    title: "Pythonica",
    subtitle: "INDENTED FLOW",
    description: "Troca blocos por indentacao e remove terminadores explicitos.",
    snippet: 'se (verdadeiro):\n  imprime("Olá mundo")',
    icon: <Sparkles className="h-5 w-5" />,
    iconColor: "rose",
  },
  {
    id: "ruby-like",
    title: "Ruby-like",
    subtitle: "BEGIN / END",
    description: "Usa blocos com inicio e fim, com nomes proximos do Ruby.",
    snippet: 'if_then (true_word) inicio\n  puts("Olá mundo")\nfim',
    icon: <Code className="h-5 w-5" />,
    iconColor: "rose",
  },
  {
    id: "mineres-like",
    title: "Mineres",
    subtitle: "TREM BUNITO",
    description: "Puxa o vocabulário para um dialeto regional em tudo que o modelo suporta.",
    snippet: 'simbora\n  oia_proce_ve("Olá mundo")\ncabo uai',
    icon: <Languages className="h-5 w-5" />,
    iconColor: "amber",
  },
];

export function IdentityStep({ values, actions }: IdentityStepProps) {
  return (
    <section className="space-y-6">
      <header className="space-y-2">
        <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-slate-500 dark:text-slate-400">
          Etapa 1
        </p>
        <h3 className="text-xl font-semibold text-slate-900 dark:text-slate-100">
          Que tipo de linguagem você quer criar?
        </h3>
        <p className="max-w-2xl text-sm text-slate-600 dark:text-slate-400">
          Escolha um ponto de partida. A seleção apenas sugere lexemas iniciais
          e continua totalmente editável.
        </p>
      </header>

      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
        {PRESET_OPTIONS.map((preset) => (
          <OptionCard
            key={preset.id}
            title={preset.title}
            subtitle={preset.subtitle}
            description={preset.description}
            snippet={preset.snippet}
            icon={preset.icon}
            iconColor={preset.iconColor}
            selected={preset.id === values.selectedPresetId}
            onClick={() => actions.selectPreset(preset.id)}
          />
        ))}
      </div>
    </section>
  );
}
