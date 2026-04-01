import * as React from "react";
import { cn } from "@/lib/utils";

const Textarea = React.forwardRef<
  HTMLTextAreaElement,
  React.TextareaHTMLAttributes<HTMLTextAreaElement>
>(({ className, ...props }, ref) => {
  return (
    <textarea
      ref={ref}
      className={cn(
        `flex w-full rounded-md border   px-3 py-2 text-foreground outline-none transition-colors placeholder:text-muted-foreground
        disabled:cursor-not-allowed disabled:opacity-50
        dark:focus:bg-slate-900/60 focus:ring-0.5 focus:ring-[#0dccf2] focus:border-[#0dccf2]
        border-slate-200/80 focus:bg-cyan-100/10 text-sm dark:border-slate-700/80 dark:bg-slate-950/60
        min-h-20 resize-y  dark:text-slate-100
        `,
        ``,
        className,
      )}
      {...props}
    />
  );
});
Textarea.displayName = "Textarea";

export { Textarea };
