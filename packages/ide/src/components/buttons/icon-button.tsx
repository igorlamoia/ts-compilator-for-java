import React from "react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "../ui/tooltip";

import { cn } from "@/lib/utils";
import { buttonVariants } from "../ui/button";

export default function IconButton({
  children,
  selected,
  className,
  tooltip,
  ...rest
}: {
  children: React.ReactNode;
  selected?: boolean;
  tooltip?: string;
} & React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <button
            className={cn(
              buttonVariants({ variant: "ghost", size: "icon" }),
              "size-8 rounded-lg cursor-pointer px-2",
              selected && "bg-black/10 dark:bg-white/10",
              className,
            )}
            {...rest}
          >
            {children}
            {tooltip && (
              <TooltipContent>
                <p>{tooltip}</p>
              </TooltipContent>
            )}
          </button>
        </TooltipTrigger>
      </Tooltip>
    </TooltipProvider>
  );
}
