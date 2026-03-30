import { Atom, Code, Languages, Sparkles, SquareTerminal } from "lucide-react";
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
  iconColor?: OptionCardIconColor["iconColor"];
}> = [
  {
    id: "traditional",
    title: "Tradicional",
    subtitle: "STANDARD C-STYLE",
    description: "Mantém a linguagem próxima do vocabulário atual.",
    snippet: 'print("Olá mundo")',
    icon: <SquareTerminal className="h-5 w-5" />,
    iconColor: "slate",
  },
  {
    id: "didactic-pt",
    title: "Didática em Português",
    subtitle: "PT-BR LOGIC",
    description: "Prefere verbos em português para ensinar a estrutura.",
    snippet: 'escreva("Olá mundo")',
    icon: <Languages className="h-5 w-5" />,
    iconColor: "violet",
  },
  {
    id: "minimal",
    title: "Minimalista",
    subtitle: "ZERO SYNTAX",
    description: "Reduz o vocabulário à menor superfície útil.",
    snippet: 'out("Olá mundo")',
    icon: <Code className="h-5 w-5" />,
    iconColor: "emerald",
  },
  {
    id: "creative",
    title: "Criativa",
    subtitle: "NATURAL SPEAK",
    description: "Explora uma linguagem mais expressiva e livre.",
    snippet: 'fale("Olá mundo")',
    icon: <Sparkles className="h-5 w-5" />,
    iconColor: "rose",
  },
  {
    id: "free",
    title: "Livre",
    subtitle: "CUSTOM DNA",
    description: "Deixa a configuração manual começar sem sugestão fixa.",
    snippet: 'diga("Olá mundo")',
    icon: <Atom className="h-5 w-5" />,
    iconColor: "sky",
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
