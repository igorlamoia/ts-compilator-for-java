import * as React from "react";
import { cn } from "@/lib/utils";

const Avatar = React.forwardRef<
  HTMLSpanElement,
  React.HTMLAttributes<HTMLSpanElement>
>(({ className, ...props }, ref) => (
  <span
    ref={ref}
    className={cn(
      "relative inline-flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-full border border-black/10 bg-slate-200 text-slate-700 dark:border-white/15 dark:bg-slate-700 dark:text-slate-100",
      className,
    )}
    {...props}
  />
));
Avatar.displayName = "Avatar";

const AvatarFallback = React.forwardRef<
  HTMLSpanElement,
  React.HTMLAttributes<HTMLSpanElement>
>(({ className, ...props }, ref) => (
  <span
    ref={ref}
    className={cn(
      "flex h-full w-full items-center justify-center text-xs font-semibold uppercase",
      className,
    )}
    {...props}
  />
));
AvatarFallback.displayName = "AvatarFallback";

export { Avatar, AvatarFallback };
