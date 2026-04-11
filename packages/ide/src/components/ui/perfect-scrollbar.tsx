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
    const overflowClass =
      axis === "y"
        ? "overflow-y-auto overflow-x-hidden"
        : axis === "both"
          ? "overflow-auto"
          : "overflow-x-auto overflow-y-hidden";

    return (
      <div
        ref={ref}
        className={cn(
          "perfect-scrollbar overscroll-contain",
          axisClass,
          overflowClass,
          className,
        )}
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
