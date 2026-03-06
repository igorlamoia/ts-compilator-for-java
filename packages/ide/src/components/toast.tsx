import { TTyperToast } from "@/contexts/ToastContext";
import { CircleCheckBig, CircleX, ShieldAlert, X } from "lucide-react";
import { ReactNode } from "react";

interface ToastProps {
  open?: boolean;
  classes?: string;
  onClose?: () => void;
  children: ReactNode;
  type?: TTyperToast;
}

export function Toast(props: ToastProps) {
  return (
    <div
      id={`toast-${props.type}`}
      className={`flex
      fixed
      backdrop-blur-sm
      z-1000
      ${props.classes}
      transition-all duration-500 ease-out transform ${
        props.open ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-20"
      }
      items-center w-full max-w-xs p-4 mb-4 text-gray-500 bg-white/75 rounded-lg shadow dark:text-gray-400 dark:bg-gray-800/75`}
      role="alert"
    >
      <Icon type={props.type || "success"} />

      <div className="ms-3 text-sm font-normal">{props.children}</div>
      <button
        type="button"
        className="animate-pulse ms-auto -mx-1.5 -my-1.5 bg-white text-gray-400 hover:text-gray-900 rounded-lg focus:ring-2 focus:ring-gray-300 p-1.5 hover:bg-gray-100 inline-flex items-center justify-center h-8 w-8 dark:text-gray-500 dark:hover:text-white dark:bg-gray-800 dark:hover:bg-gray-700"
        data-dismiss-target={"#toast-" + props.type}
        aria-label="Close"
        onClick={props.onClose}
      >
        <span className="sr-only">Close</span>
        <X className="w-3 h-3" />
      </button>
    </div>
  );
}

function Icon(props: { type: TTyperToast }) {
  return (
    <div>
      {props.type === "success" && (
        <div className="inline-flex items-center justify-center shrink-0 w-8 h-8 text-green-500 bg-green-100 rounded-lg dark:bg-green-800 dark:text-green-200">
          <CircleCheckBig className="w-5 h-5" />
          <span className="sr-only">Check icon</span>
        </div>
      )}
      {props.type === "error" && (
        <div className="inline-flex items-center justify-center shrink-0 w-8 h-8 text-red-500 bg-red-100 rounded-lg dark:bg-red-800 dark:text-red-200">
          <CircleX className="w-5 h-5" />
          <span className="sr-only">Error icon</span>
        </div>
      )}
      {(props.type === "info" || props.type === "warning") && (
        <div className="inline-flex items-center justify-center shrink-0 w-8 h-8 text-orange-500 bg-orange-100 rounded-lg dark:bg-orange-700 dark:text-orange-200">
          <ShieldAlert className="w-5 h-5" />
          <span className="sr-only">Warning icon</span>
        </div>
      )}
    </div>
  );
}
