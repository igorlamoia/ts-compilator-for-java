import { GradientText } from "@/components/text/gradient";
import { Subtitle } from "@/components/text/subtitle";
import { Title } from "@/components/text/title";
import { HeroButton } from "../buttons/hero";

export type KeywordCustomizerHeaderProps = {
  hasChanges: boolean;
  onCancel: () => void;
  onReset: () => void;
};

export function KeywordCustomizerHeader({
  hasChanges,
  onCancel,
  onReset,
}: KeywordCustomizerHeaderProps) {
  return (
    <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <Title as="h1" id="keyword-customizer-title">
          <GradientText>DNA da Linguagem</GradientText>
        </Title>
        <Subtitle id="keyword-customizer-description" className="mt-1">
          Defina o vocabulário, as regras e o fluxo da sua linguagem.
        </Subtitle>
      </div>
      <div className="flex items-center gap-3">
        <HeroButton type="button" variant="ghost" onClick={onCancel}>
          Cancelar
        </HeroButton>
        <HeroButton
          onClick={onReset}
          type="button"
          variant="outline"
          disabled={!hasChanges}
        >
          Restaurar Padrão
        </HeroButton>
      </div>
    </div>
  );
}
