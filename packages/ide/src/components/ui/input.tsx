import * as React from "react";
import { cn } from "@/lib/utils";

const Input = React.forwardRef<
  HTMLInputElement,
  React.InputHTMLAttributes<HTMLInputElement>
>(({ className, type, ...props }, ref) => {
  return (
    <input
      type={type}
      className={cn(
        "flex sm:text-sm focus:outline-none p-4 h-11 w-full rounded-md border border-white/10 bg-white/5 text-xs text-foreground outline-none transition-colors placeholder:text-muted-foreground  focus:bg-white/10 focus:ring-0.5 focus:ring-[#0dccf2] focus:border-[#0dccf2]  disabled:cursor-not-allowed disabled:opacity-50",
        className,
      )}
      ref={ref}
      {...props}
    />
  );
});
Input.displayName = "Input";

export { Input };
