import { forwardRef } from "react";
import type { HTMLAttributes } from "react";

import { cn } from "@/lib/utils";

import { PerfectScrollbar } from "./perfect-scrollbar";

type CodeScrollAreaProps = HTMLAttributes<HTMLDivElement> & {
  axis?: "x" | "y" | "both";
  size?: number | string;
  height?: number | string;
};

export const CodeScrollArea = forwardRef<HTMLDivElement, CodeScrollAreaProps>(
  ({ axis = "both", size = 6, className, ...props }, ref) => (
    <PerfectScrollbar
      ref={ref}
      axis={axis}
      size={size}
      className={cn("code-scroll-area", className)}
      {...props}
    />
  ),
);

CodeScrollArea.displayName = "CodeScrollArea";
