import { cn } from "@/lib/utils";
import { HeadingLevel } from "./variations";

interface SubtitleProps extends React.HTMLAttributes<HTMLElement> {
  as?: HeadingLevel;
  children: React.ReactNode;
}

export function Subtitle({ as = "p", className, children }: SubtitleProps) {
  const Element = as;
  return (
    <Element className={cn("text-slate-400 text-base", className)}>
      {children}
    </Element>
  );
}
