import { forwardRef } from "react";
import type { CSSProperties, HTMLAttributes } from "react";

import { cn } from "@/lib/utils";

type PerfectScrollbarProps = HTMLAttributes<HTMLDivElement> & {
  axis?: "x" | "y" | "both";
  size?: number | string;
  height?: number | string;
};

export const PerfectScrollbar = forwardRef<
  HTMLDivElement,
  PerfectScrollbarProps
>(
  (
    { axis = "both", size, height = 4, className, style, children, ...props },
    ref,
  ) => {
    const resolvedSizeInput = size ?? height;
    const resolvedSize =
      typeof resolvedSizeInput === "number"
        ? `${resolvedSizeInput}px`
        : (resolvedSizeInput ?? "4px");

    const axisClass =
      axis === "y"
        ? "perfect-scrollbar-y"
        : axis === "both"
          ? "perfect-scrollbar-both"
          : "perfect-scrollbar-x";

    return (
      <div
        ref={ref}
        className={cn("perfect-scrollbar", axisClass, className)}
        style={
          {
            ...style,
            ["--perfect-scrollbar-size" as string]: resolvedSize,
          } as CSSProperties
        }
        {...props}
      >
        {children}
      </div>
    );
  },
);

PerfectScrollbar.displayName = "PerfectScrollbar";
