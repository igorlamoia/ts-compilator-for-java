import { cn } from "@/lib/utils";
import { HeadingLevel, variantStyles } from "./variations";

interface TitleProps extends React.HTMLAttributes<HTMLElement> {
  as?: HeadingLevel;
  children: React.ReactNode;
}

export function Title({ as = "h2", className, children }: TitleProps) {
  const Element = as;
  return (
    <Element className={cn(variantStyles[as], className)}>{children}</Element>
  );
}
