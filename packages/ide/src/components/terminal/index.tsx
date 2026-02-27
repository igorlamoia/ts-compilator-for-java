"use client";

import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { cn } from "@/lib/utils";
import { Instruction } from "@ts-compilator-for-java/compiler/interpreter/constants";
import { Body } from "./body";
import { Header } from "./header";

export interface TerminalLine {
  id: number;
  content: string;
  type: "output" | "input" | "error" | "success" | "info" | "prompt";
}

interface ITerminalViewProps {
  isTerminalOpen: boolean;
  toggleTerminal: () => void;
  intermediateCode: Instruction[];
}

let lineIdCounter = 0;

export function createLine(
  content: string,
  type: TerminalLine["type"] = "output",
): TerminalLine {
  return { id: lineIdCounter++, content, type };
}

export default function TerminalView({
  isTerminalOpen,
  toggleTerminal,
  intermediateCode,
}: ITerminalViewProps) {
  const [lines, setLines] = useState<TerminalLine[]>([
    createLine("Van Hohenheim! O Henheim da luz", "info"),
  ]);
  const [currentInput, setCurrentInput] = useState("");
  const [isExecuting, setIsExecuting] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  // Focar no input quando o terminal abrir
  useEffect(() => {
    if (isTerminalOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isTerminalOpen]);

  return (
    <>
      <AnimatePresence>
        {isTerminalOpen && (
          <motion.div
            initial={{ y: "50%", opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: "50%", opacity: 0 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className={cn(
              "absolute left-0 right-0 bottom-0 z-50 dark:backdrop-blur-[5px] backdrop-blur-sm",
              "dark:bg-neutral-950/70 shadow-[0_-20px_60px_-40px_rgba(255,255,255,0.9)] dark:shadow-[0_-20px_60px_-40px_rgba(0,0,0,0.9)]",
            )}
            onClick={() => inputRef.current?.focus()}
          >
            <Header
              toggleTerminal={toggleTerminal}
              setLines={setLines}
              isExecuting={isExecuting}
            />

            <Body
              lines={lines}
              intermediateCode={intermediateCode}
              currentInput={currentInput}
              inputRef={inputRef}
              setIsExecuting={setIsExecuting}
              setCurrentInput={setCurrentInput}
              setLines={setLines}
              toggleTerminal={toggleTerminal}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
