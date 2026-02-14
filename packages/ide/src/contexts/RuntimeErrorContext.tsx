import {
  createContext,
  ReactNode,
  useContext,
  useState,
  Dispatch,
  SetStateAction,
} from "react";

type RuntimeErrorContextType = {
  runtimeErrorInstructionPointer: number | null;
  setRuntimeErrorInstructionPointer: Dispatch<SetStateAction<number | null>>;
};

const RuntimeErrorContext = createContext<RuntimeErrorContextType | null>(null);

export function RuntimeErrorProvider({ children }: { children: ReactNode }) {
  const [runtimeErrorInstructionPointer, setRuntimeErrorInstructionPointer] =
    useState<number | null>(null);

  return (
    <RuntimeErrorContext.Provider
      value={{
        runtimeErrorInstructionPointer,
        setRuntimeErrorInstructionPointer,
      }}
    >
      {children}
    </RuntimeErrorContext.Provider>
  );
}

export function useRuntimeError() {
  const context = useContext(RuntimeErrorContext);
  if (!context) {
    throw new Error("useRuntimeError must be used within RuntimeErrorProvider");
  }
  return context;
}
