import IconButton from "@/components/buttons/icon-button";
import { StepForward } from "lucide-react";
import { useRouter } from "next/router";
import { t } from "@/i18n";
import { RainbowButton } from "@/components/ui/rainbow-button";

interface MenuProps {
  handleRun: () => void;
  runAll: () => void;
  toggleTerminal: () => void;
}

export function Menu({ handleRun, runAll, toggleTerminal }: MenuProps) {
  const { locale } = useRouter();

  return (
    <div className="flex items-center justify-between gap-4 border-b border-black/10 dark:border-white/10 px-4 py-1.5">
      <div className="flex items-center gap-4 text-xs text-muted-foreground">
        <span className="rounded-full bg-white/10 px-3 py-1 text-foreground">
          Estúdio
        </span>
        <div className="hidden items-center gap-3 md:flex">
          <button className="hover:text-foreground">Edit</button>
          <button className="hover:text-foreground" onClick={toggleTerminal}>
            Terminal
          </button>
          <button className="hover:text-foreground">Help</button>
        </div>
      </div>
      <div className="flex items-center gap-2">
        <IconButton
          onClick={handleRun}
          tooltip={t(locale, "ui.run_lexer")}
          className="size-3 p-3 rounded-lg"
        >
          <StepForward />
        </IconButton>
        <RainbowButton variant="outline" onClick={runAll}>
          {t(locale, "ui.run_all")}
        </RainbowButton>
      </div>
    </div>
  );
}
