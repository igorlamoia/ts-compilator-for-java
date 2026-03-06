import * as React from "react";
import { cn } from "@/lib/utils";
import {
  AlertCircle,
  CheckCircle2,
  Info,
  TriangleAlert,
  X,
} from "lucide-react";

type AlertVariant = "error" | "warning" | "info" | "success";

const variantConfig = {
  error: {
    container:
      "bg-red-500/10 border-red-500/30 text-red-300 shadow-[0_4px_20px_rgba(239,68,68,0.08)]",
    icon: "text-red-400",
    close: "text-red-400 hover:text-red-200",
    Icon: AlertCircle,
  },
  warning: {
    container:
      "bg-amber-500/10 border-amber-500/30 text-amber-300 shadow-[0_4px_20px_rgba(245,158,11,0.08)]",
    icon: "text-amber-400",
    close: "text-amber-400 hover:text-amber-200",
    Icon: TriangleAlert,
  },
  info: {
    container:
      "bg-sky-500/10 border-sky-500/30 text-sky-300 shadow-[0_4px_20px_rgba(14,165,233,0.08)]",
    icon: "text-sky-400",
    close: "text-sky-400 hover:text-sky-200",
    Icon: Info,
  },
  success: {
    container:
      "bg-emerald-500/10 border-emerald-500/30 text-emerald-300 shadow-[0_4px_20px_rgba(16,185,129,0.08)]",
    icon: "text-emerald-400",
    close: "text-emerald-400 hover:text-emerald-200",
    Icon: CheckCircle2,
  },
} satisfies Record<AlertVariant, object>;

interface AlertProps extends React.HTMLAttributes<HTMLDivElement> {
  variant: AlertVariant;
  children: React.ReactNode;
  onClose?: () => void;
}

const Alert = React.forwardRef<HTMLDivElement, AlertProps>(
  ({ variant, children, onClose, className, ...props }, ref) => {
    const config = variantConfig[variant];
    const { Icon } = config;

    return (
      <div
        ref={ref}
        role="alert"
        className={cn(
          "p-4 rounded-xl border text-sm flex justify-between items-center backdrop-blur-[3px] animate-fade-in",
          config.container,
          className,
        )}
        {...props}
      >
        <div className="flex items-center gap-3">
          <Icon className={cn("w-5 h-5 shrink-0", config.icon)} />
          <span>{children}</span>
        </div>
        {onClose && (
          <button
            onClick={onClose}
            aria-label="Dismiss"
            className={cn(
              "ml-4 p-1 rounded transition-colors shrink-0",
              config.close,
            )}
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>
    );
  },
);
Alert.displayName = "Alert";

export { Alert };
export type { AlertVariant };
