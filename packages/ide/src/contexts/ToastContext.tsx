// context/ToastContext.tsx
import { Toast } from "@/components/toast";
import React, { createContext, useContext, useState, ReactNode } from "react";

export type TTyperToast = "success" | "error" | "info" | "warning";
type ToastOptions = {
  message: string;
  duration?: number;
  position?: "top-left" | "top-right" | "bottom-left" | "bottom-right";
  type: TTyperToast;
};

const DEFAULT_TOAST_OPTIONS: ToastOptions = {
  message: "",
  duration: 3000,
  position: "top-right",
  type: "info",
};

type ToastContextType = {
  showToast: (options: ToastOptions) => void;
};

const ToastContext = createContext<ToastContextType>({
  showToast: () => {},
});

export const ToastProvider = ({ children }: { children: ReactNode }) => {
  const [toast, setToast] = useState<ToastOptions>(DEFAULT_TOAST_OPTIONS);

  const showToast = ({
    message,
    duration = 5000,
    position = "top-right",
    type = "info",
  }: ToastOptions) => {
    setToast({ message, duration, position, type });
    setTimeout(() => setToast(DEFAULT_TOAST_OPTIONS), duration);
  };

  const closeToast = () => setToast(DEFAULT_TOAST_OPTIONS);

  const positionClasses = {
    "top-left": "top-5 left-5",
    "top-right": "top-5 right-5",
    "bottom-left": "bottom-5 left-5",
    "bottom-right": "bottom-5 right-5",
  };

  // const typeClasses = {
  //   success: "bg-green-500",
  //   error: "bg-red-500",
  //   info: "bg-blue-500",
  //   warning: "bg-yellow-500",
  // };

  return (
    <ToastContext.Provider value={{ showToast }}>
      <Toast
        open={!!toast.message}
        onClose={closeToast}
        classes={`${positionClasses[toast.position ?? "top-right"]}`}
        type={toast.type}
      >
        {toast.message}
      </Toast>
      {children}
    </ToastContext.Provider>
  );
};

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error("useToast must be used within a ToastProvider");
  }
  return context;
};
