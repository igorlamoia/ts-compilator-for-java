"use client";

import { createContext, useContext, useState } from "react";

type TerminalContextType = {
  isTerminalOpen: boolean;
  setIsTerminalOpen: React.Dispatch<React.SetStateAction<boolean>>;
};

const TerminalContext = createContext<TerminalContextType | undefined>(
  undefined,
);

export function TerminalProvider({ children }: { children: React.ReactNode }) {
  const [isTerminalOpen, setIsTerminalOpen] = useState(false);

  return (
    <TerminalContext.Provider value={{ isTerminalOpen, setIsTerminalOpen }}>
      {children}
    </TerminalContext.Provider>
  );
}

export function useTerminalContext() {
  const context = useContext(TerminalContext);
  if (!context) {
    throw new Error(
      "useTerminalContext must be used within a TerminalContext.Provider",
    );
  }
  return context;
}

export { TerminalContext };
