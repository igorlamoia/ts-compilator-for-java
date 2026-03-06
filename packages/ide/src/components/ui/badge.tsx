import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center rounded-sm px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide transition-colors focus:outline-none",
  {
    variants: {
      variant: {
        default:
          "border-transparent bg-slate-800 text-white dark:bg-slate-200 dark:text-slate-900",
        secondary:
          "border-slate-300/80 bg-slate-100 text-slate-700 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-100",
        success:
          "border-green-300/80 bg-green-100 text-green-400 dark:border-green-400 dark:bg-green-500/20 dark:text-green-400",
        error:
          "items-center border-red-300/80 bg-red-100 text-red-700 dark:border-red-600 dark:bg-red-700/20 dark:text-red-600",
        warning:
          "border-yellow-300/80 bg-yellow-100 text-yellow-700 dark:border-yellow-600 dark:bg-yellow-700/20 dark:text-yellow-400",
        info: "border-blue-300/80 bg-blue-100 text-blue-700 dark:border-blue-600 dark:bg-blue-700/20 dark:text-blue-500",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  },
);

export interface BadgeProps
  extends
    React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  );
}

export { Badge, badgeVariants };
