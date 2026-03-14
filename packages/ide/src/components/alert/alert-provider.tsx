import React, { createContext, useContext, useState, useCallback } from "react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface AlertConfig {
  title?: string;
  description: string;
  confirmText?: string;
  cancelText?: string;
  variant?: "default" | "destructive";
}

interface AlertContextType {
  showAlert: (config: AlertConfig) => Promise<boolean>;
  showMessage: (description: string, title?: string) => Promise<void>;
}

const AlertContext = createContext<AlertContextType | undefined>(undefined);

export function AlertProvider({ children }: { children: React.ReactNode }) {
  const [alertConfig, setAlertConfig] = useState<AlertConfig | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [resolvePromise, setResolvePromise] = useState<
    ((value: boolean) => void) | null
  >(null);

  const showAlert = useCallback((config: AlertConfig): Promise<boolean> => {
    setAlertConfig(config);
    setIsOpen(true);
    return new Promise<boolean>((resolve) => {
      setResolvePromise(() => resolve);
    });
  }, []);

  const showMessage = useCallback(
    (description: string, title?: string): Promise<void> => {
      return showAlert({
        title: title || "Aviso",
        description,
        confirmText: "OK",
      }).then(() => {});
    },
    [showAlert],
  );

  const handleConfirm = () => {
    if (resolvePromise) {
      resolvePromise(true);
    }
    setIsOpen(false);
    setAlertConfig(null);
    setResolvePromise(null);
  };

  const handleCancel = () => {
    if (resolvePromise) {
      resolvePromise(false);
    }
    setIsOpen(false);
    setAlertConfig(null);
    setResolvePromise(null);
  };

  return (
    <AlertContext.Provider value={{ showAlert, showMessage }}>
      {children}
      <AlertDialog open={isOpen} onOpenChange={setIsOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            {alertConfig?.title && (
              <AlertDialogTitle>{alertConfig.title}</AlertDialogTitle>
            )}
            <AlertDialogDescription>
              {alertConfig?.description}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            {alertConfig?.cancelText !== undefined && (
              <AlertDialogCancel onClick={handleCancel}>
                {alertConfig.cancelText || "Cancelar"}
              </AlertDialogCancel>
            )}
            <AlertDialogAction
              onClick={handleConfirm}
              className={
                alertConfig?.variant === "destructive"
                  ? "bg-red-500/20 text-red-400 hover:bg-red-500/30"
                  : ""
              }
            >
              {alertConfig?.confirmText || "Confirmar"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </AlertContext.Provider>
  );
}

export function useAlert() {
  const context = useContext(AlertContext);
  if (!context) {
    throw new Error("useAlert must be used within an AlertProvider");
  }
  return context;
}
