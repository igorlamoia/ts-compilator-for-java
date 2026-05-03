import { cn } from "@/lib/utils";

type DefaultProps = {
  className?: string;
  children: React.ReactNode;
};

function Index({ children, className }: DefaultProps) {
  return (
    <p
      className={cn(
        "text-[11px] font-semibold uppercase tracking-[0.28em] text-slate-500 dark:text-slate-400",
        className,
      )}
    >
      {children}
    </p>
  );
}

function Title({ children, className }: DefaultProps) {
  return (
    <h3
      className={cn(
        "text-xl font-semibold text-slate-900 dark:text-slate-100",
        className,
      )}
    >
      {children}
    </h3>
  );
}
function Description({ children, className }: DefaultProps) {
  return (
    <p
      className={cn(
        "max-w-3xl text-sm text-slate-600 dark:text-slate-400",
        className,
      )}
    >
      {children}
    </p>
  );
}

function Header({
  className,
  children,
}: {
  className?: string;
  children: React.ReactNode;
}) {
  return <div className={cn("space-y-2", className)}>{children}</div>;
}

export const Step = {
  Index,
  Title,
  Description,
  Header,
};
