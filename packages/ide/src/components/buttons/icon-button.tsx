import React from "react";
import { Tooltip, TooltipProvider, TooltipTrigger } from "../ui/tooltip";

import { cn } from "@/lib/utils";
import { buttonVariants } from "../ui/button";

export default function IconButton({
  children,
  className,
  ...rest
}: {
  children: React.ReactNode;
} & React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <button
            aria-label="Settings"
            className={cn(
              buttonVariants({ variant: "ghost", size: "icon" }),
              "size-8 rounded-xl cursor-pointer",
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
