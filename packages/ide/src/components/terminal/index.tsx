"use client";

import {
  useEffect,
  useRef,
  useState,
  useCallback,
  KeyboardEvent,
} from "react";
import { motion, AnimatePresence } from "motion/react";
import { cn } from "@/lib/utils";
import { Interpreter } from "@ts-compilator-for-java/compiler/interpreter";
import { Instruction } from "@ts-compilator-for-java/compiler/interpreter/constants";

interface TerminalLine {
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

function createLine(
  content: string,
  type: TerminalLine["type"] = "output"
): TerminalLine {
  return { id: lineIdCounter++, content, type };
}

export default function TerminalView({
  isTerminalOpen,
  toggleTerminal,
  intermediateCode,
}: ITerminalViewProps) {
  const [lines, setLines] = useState<TerminalLine[]>([
    createLine("Welcome to the Lamoia's Terminal!", "info"),
  ]);
  const [currentInput, setCurrentInput] = useState("");
  const [isExecuting, setIsExecuting] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const resolveInput = useRef<((value: string) => void) | null>(null);
  const commandHistory = useRef<string[]>([]);
  const historyPointer = useRef<number>(0);

  const addLine = useCallback(
    (content: string, type: TerminalLine["type"] = "output") => {
      setLines((prev) => [...prev, createLine(content, type)]);
    },
    []
  );

  // Auto-scroll ao adicionar novas linhas
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [lines]);

  // Focar no input quando o terminal abrir
  useEffect(() => {
    if (isTerminalOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isTerminalOpen]);

  // Executar interpretador quando receber código intermediário
  const runInterpreter = useCallback(async () => {
    if (intermediateCode.length === 0) return;

    setIsExecuting(true);

    const inputPromise = (): Promise<string> =>
      new Promise((resolve) => {
        resolveInput.current = resolve;
      });

    const io = {
      stdout: (msg: string) => {
        const cleanMsg = msg.replace(/\r\n/g, "\n").replace(/\r/g, "\n");
        const parts = cleanMsg.split("\n");
        parts.forEach((part, i) => {
          if (part.trim() !== "" || i > 0) {
            addLine(part, "output");
          }
        });
      },
      stdin: inputPromise,
    };

    addLine("", "output");
    addLine("🟢  Iniciando execução do código...", "success");
    addLine("", "output");

    const interpreter = new Interpreter(intermediateCode, io);

    try {
      await interpreter.execute({ current: "" });
      addLine("", "output");
      addLine("🟢  Finalizando execução do código...", "success");
      addLine("", "output");
    } catch (e: unknown) {
      if (e instanceof Error) {
        addLine(`❌ Erro: ${e.message}`, "error");
      } else {
        addLine("❌ Erro: An unknown error occurred.", "error");
      }
    }

    setIsExecuting(false);
    resolveInput.current = null;
  }, [intermediateCode, addLine]);

  useEffect(() => {
    if (intermediateCode?.length > 0) runInterpreter();
  }, [intermediateCode, runInterpreter]);

  // Processar comandos internos
  const processCommand = useCallback(
    (command: string) => {
      const trimmed = command.trim().toLowerCase();

      // Se o interpretador está esperando input, resolve a promise
      if (resolveInput.current) {
        addLine(`$ ${command}`, "input");
        resolveInput.current(command);
        resolveInput.current = null;
        return;
      }

      addLine(`$ ${command}`, "input");

      switch (trimmed) {
        case "clear":
        case "cls":
          setLines([]);
          break;
        case "help":
          addLine(
            "Available commands: ping, clear, cls, help, exit, ctrl+' to toggle terminal",
            "info"
          );
          break;
        case "ping":
          addLine("Pong! 🏓", "output");
          break;
        case "exit":
          addLine("❌  Exiting terminal...", "output");
          setTimeout(() => {
            setLines([createLine("Welcome to the Lamoia's Terminal!", "info")]);
            toggleTerminal();
          }, 1000);
          break;
        default:
          if (trimmed !== "") {
            addLine(`Comando não reconhecido: ${command}`, "error");
          }
          break;
      }
    },
    [addLine, toggleTerminal]
  );

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      const command = currentInput;
      if (command.trim() !== "") {
        commandHistory.current.push(command);
        historyPointer.current = commandHistory.current.length;
      }
      processCommand(command);
      setCurrentInput("");
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      if (historyPointer.current > 0) {
        historyPointer.current -= 1;
        setCurrentInput(
          commandHistory.current[historyPointer.current] || ""
        );
      }
    } else if (e.key === "ArrowDown") {
      e.preventDefault();
      if (historyPointer.current < commandHistory.current.length - 1) {
        historyPointer.current += 1;
        setCurrentInput(
          commandHistory.current[historyPointer.current] || ""
        );
      } else {
        historyPointer.current = commandHistory.current.length;
        setCurrentInput("");
      }
    } else if (e.ctrlKey && e.key === "c") {
      addLine("Process interrupted.", "error");
      setCurrentInput("");
      resolveInput.current = null;
    }
  };

  // Atalhos globais (ctrl+', ctrl+j, Escape)
  useEffect(() => {
    const handleGlobalKeyDown = (event: globalThis.KeyboardEvent) => {
      if (event.ctrlKey && ["'", "j"].includes(event.key)) {
        toggleTerminal();
      } else if (event.key === "Escape" && isTerminalOpen) {
        toggleTerminal();
      }
    };

    document.addEventListener("keydown", handleGlobalKeyDown);
    return () => document.removeEventListener("keydown", handleGlobalKeyDown);
  }, [toggleTerminal, isTerminalOpen]);

  const getLineColor = (type: TerminalLine["type"]) => {
    switch (type) {
      case "error":
        return "text-red-400";
      case "success":
        return "text-green-400";
      case "info":
        return "text-cyan-400";
      case "input":
        return "text-cyan-300";
      case "prompt":
        return "text-yellow-400";
      default:
        return "text-gray-200";
    }
  };

  return (
    <AnimatePresence>
      {isTerminalOpen && (
        <motion.div
          initial={{ y: "100%", opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: "100%", opacity: 0 }}
          transition={{ type: "spring", damping: 25, stiffness: 300 }}
          className={cn(
            "fixed bottom-10 left-0 right-0 z-50 w-full",
            "backdrop-blur-xl bg-black/70 border-t border-white/10"
          )}
          onClick={() => inputRef.current?.focus()}
        >
          {/* Header com bolinhas estilo macOS */}
          <div className="flex items-center justify-between border-b border-white/10 px-4 py-2">
            <div className="flex items-center gap-2">
              <div className="flex gap-x-2">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleTerminal();
                  }}
                  className="h-3 w-3 rounded-full bg-red-500 hover:bg-red-400 transition-colors"
                  aria-label="Close terminal"
                />
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setLines([]);
                  }}
                  className="h-3 w-3 rounded-full bg-yellow-500 hover:bg-yellow-400 transition-colors"
                  aria-label="Clear terminal"
                />
                <div className="h-3 w-3 rounded-full bg-green-500" />
              </div>
              <span className="ml-3 text-xs text-gray-400 font-mono select-none">
                lamoia-terminal
              </span>
            </div>
            {isExecuting && (
              <motion.span
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-xs text-green-400 font-mono"
              >
                ● executing...
              </motion.span>
            )}
          </div>

          {/* Corpo do terminal */}
          <div
            ref={scrollRef}
            className="h-[260px] overflow-y-auto overflow-x-hidden p-4 font-mono text-sm scrollbar-none"
          >
            {lines.map((line, index) => (
              <motion.div
                key={line.id}
                initial={
                  index >= lines.length - 3
                    ? { opacity: 0, y: -5 }
                    : { opacity: 1, y: 0 }
                }
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.15 }}
                className={cn(
                  "whitespace-pre-wrap break-all leading-relaxed",
                  getLineColor(line.type)
                )}
              >
                {line.content || "\u00A0"}
              </motion.div>
            ))}

            {/* Linha de input */}
            <div className="flex items-center gap-1 mt-1">
              <span className="text-cyan-400 select-none">$</span>
              <input
                ref={inputRef}
                type="text"
                value={currentInput}
                onChange={(e) => setCurrentInput(e.target.value)}
                onKeyDown={handleKeyDown}
                className="flex-1 bg-transparent text-gray-200 outline-none caret-cyan-400 font-mono text-sm"
                spellCheck={false}
                autoComplete="off"
              />
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
