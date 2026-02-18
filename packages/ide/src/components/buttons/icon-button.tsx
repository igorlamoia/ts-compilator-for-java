import React from "react";
import { Tooltip, TooltipProvider, TooltipTrigger } from "../ui/tooltip";

import { cn } from "@/lib/utils";
import { buttonVariants } from "../ui/button";

export default function IconButton({
  children,
  selected,
  className,
  ...rest
}: {
  children: React.ReactNode;
  selected?: boolean;
} & React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <button
            className={cn(
              buttonVariants({ variant: "ghost", size: "icon" }),
              "size-8 rounded-xl cursor-pointer px-2",
              selected && "bg-black/10 dark:bg-white/10",
              className,
            )}
            {...rest}
          >
            {children}
          </button>
        </TooltipTrigger>
      </Tooltip>
    </TooltipProvider>
  );
}
