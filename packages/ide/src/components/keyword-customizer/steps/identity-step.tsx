import { OptionCard } from "../option-card";
import type { WizardPresetId } from "../wizard-model";

export type IdentityStepProps = {
  selectedPresetId: WizardPresetId;
  onPresetSelect: (presetId: WizardPresetId) => void;
};

const PRESET_OPTIONS: Array<{
  id: WizardPresetId;
  title: string;
  description: string;
  snippet: string;
}> = [
  {
    id: "traditional",
    title: "Tradicional",
    description: "Mantém a linguagem próxima do vocabulário atual.",
    snippet: 'print("Olá mundo")',
  },
  {
    id: "didactic-pt",
    title: "Didática em Português",
    description: "Prefere verbos em português para ensinar a estrutura.",
    snippet: 'escreva("Olá mundo")',
  },
  {
    id: "minimal",
    title: "Minimalista",
    description: "Reduz o vocabulário à menor superfície útil.",
    snippet: 'out("Olá mundo")',
  },
  {
    id: "creative",
    title: "Criativa",
    description: "Explora uma linguagem mais expressiva e livre.",
    snippet: 'fale("Olá mundo")',
  },
  {
    id: "free",
    title: "Livre",
    description: "Deixa a configuração manual começar sem sugestão fixa.",
    snippet: 'diga("Olá mundo")',
  },
];

export function IdentityStep({
  selectedPresetId,
  onPresetSelect,
}: IdentityStepProps) {
  return (
    <section className="space-y-6">
      <header className="space-y-2">
        <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-slate-500 dark:text-slate-400">
          Etapa 1
        </p>
        <h3 className="text-xl font-semibold text-slate-900 dark:text-slate-100">
          Identidade
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
            description={preset.description}
            snippet={preset.snippet}
            selected={preset.id === selectedPresetId}
            onClick={() => onPresetSelect(preset.id)}
          />
        ))}
      </div>
    </section>
  );
}
