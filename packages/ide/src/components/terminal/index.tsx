"use client";

import { useEffect, useRef } from "react";
import { Terminal } from "xterm";
import { MutableRefObject } from "react";
import "xterm/css/xterm.css";
import { Interpreter } from "@ts-compilator-for-java/compiler/interpreter";
import { loadInstructionsFromString } from "@ts-compilator-for-java/compiler/interpreter/scan";
import PROGRAM from "@ts-compilator-for-java/compiler/resource/intermediate-code";

interface ITerminalViewProps {
  isTerminalOpen: boolean;
  toggleTerminal: () => void;
}

function initPrompt(terminal: MutableRefObject<Terminal | null>) {
  if (!terminal.current) return;
  terminal.current.write("\r\n$ ");
}

function handleEnter(
  terminal: MutableRefObject<Terminal | null>,
  commandRef: MutableRefObject<string>,
  commandHistory: MutableRefObject<string[]>,
  historyPointer: MutableRefObject<number>
) {
  if (!terminal.current) return;
  terminal.current.writeln(
    `\r\nComando não reconhecido: ${commandRef.current}\n`
  );

  // Add the command to history if it's not empty
  if (commandRef.current.trim() !== "") {
    commandHistory.current.push(commandRef.current);
    historyPointer.current = commandHistory.current.length; // Reset pointer to the end
  }

  commandRef.current = "";
  initPrompt(terminal);
}

function handleWelcomeMessage(terminal: MutableRefObject<Terminal | null>) {
  if (!terminal.current) return;
  terminal.current.writeln("\r\nWelcome to the Lamoia's Terminal!");
  initPrompt(terminal);
}

export default function TerminalView({
  isTerminalOpen,
  toggleTerminal,
}: ITerminalViewProps) {
  const terminalRef = useRef<HTMLDivElement>(null);
  const terminal = useRef<Terminal | null>(null);
  const commandRef = useRef<string>("");

  // Command history and pointer
  const commandHistory = useRef<string[]>([]);
  const historyPointer = useRef<number>(0);

  const resolveInput = useRef<(value: string) => void>();
  const runInterpreter = async () => {
    if (!terminal.current) return;

    const inputPromise = (): Promise<string> =>
      new Promise((resolve) => {
        resolveInput.current = resolve;
      });

    const io = {
      stdout: (msg: string) => terminal.current?.write(msg),
      stdin: inputPromise,
    };
    terminal.current.writeln("\n");
    const instructions = loadInstructionsFromString(PROGRAM);
    const interpreter = new Interpreter(instructions, io); // `program` vem do seu Parser/Lexer

    terminal.current.writeln("\n🟢  Iniciando execução do código...\n");

    try {
      await interpreter.execute();
    } catch (e: any) {
      terminal.current.writeln(`❌ Erro: ${e.message}`);
    }

    initPrompt(terminal);
  };

  useEffect(() => {
    if (terminalRef.current && !terminal.current) {
      terminal.current = new Terminal({
        cols: 120,
        rows: 14,
        theme: {
          background: "rgba(0, 0, 0, 0)",
        },
      });

      terminal.current.open(terminalRef.current);
      handleWelcomeMessage(terminal);

      terminal.current.onData(async (data) => {
        if (!terminal.current) return;
        if (commandRef.current.trim().toLowerCase() === "roda pra mim") {
          // Chamar o interpretador aqui
          runInterpreter();
          commandRef.current = "";
          return;
        }

        const possibleCommands = ["clear", "cls", "help", "exit"];
        if (possibleCommands.includes(commandRef.current)) {
          switch (commandRef.current) {
            case "clear":
            case "cls":
              terminal.current.clear();
              initPrompt(terminal);
              break;
            case "help":
              terminal.current.writeln(
                "\r\nAvailable commands:roda pra mim, clear, cls, help, exit, ctrl+c to interrupt, ctrl+' to toggle terminal\r\n"
              );
              initPrompt(terminal);
              break;
            case "exit":
              terminal.current.writeln("\r\nExiting terminal...");
              setTimeout(() => {
                terminal?.current?.clear();
                toggleTerminal();
                handleWelcomeMessage(terminal);
              }, 1000);
              break;
          }
          commandRef.current = "";
          return;
        }

        switch (data) {
          case "\x03": // Ctrl+C
            terminal.current.writeln("\r\nProcess interrupted.");
            initPrompt(terminal);
            commandRef.current = "";
            return;
          case "\r": // Enter
            terminal.current?.writeln(""); // move to next line
            if (resolveInput.current) {
              resolveInput.current(commandRef.current); // ⬅️ Pass input to Interpreter
              resolveInput.current = undefined;
            } else {
              handleEnter(terminal, commandRef, commandHistory, historyPointer);
            }
            return;
          case "\u007F": // Backspace
            if (commandRef.current.length > 0) {
              commandRef.current = commandRef.current.slice(0, -1);
              terminal.current.write("\b \b");
            }
            return;
          case "\x1B[A": // Up arrow
            if (historyPointer.current > 0) {
              historyPointer.current -= 1;
              commandRef.current =
                commandHistory.current[historyPointer.current] || "";
              terminal.current.write("\r\x1B[K$ " + commandRef.current); // Clear line and write command
            }
            return;
          case "\x1B[B": // Down arrow
            if (historyPointer.current < commandHistory.current.length - 1) {
              historyPointer.current += 1;
              commandRef.current =
                commandHistory.current[historyPointer.current] || "";
              terminal.current.write("\r\x1B[K$ " + commandRef.current); // Clear line and write command
            } else {
              historyPointer.current = commandHistory.current.length;
              commandRef.current = "";
              terminal.current.write("\r\x1B[K$ "); // Clear line
            }
            return;
          default:
            commandRef.current += data;
            terminal.current.write(data);
            return;
        }
      });
    }
  }, []);

  useEffect(() => {
    if (isTerminalOpen && terminal.current) {
      terminal.current.focus();
    }
  }, [isTerminalOpen]);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.ctrlKey && ["'", "j"].includes(event.key)) {
        toggleTerminal();
      } else if (event.key === "Escape") {
        toggleTerminal();
      } else if (event.ctrlKey && event.key === "c") {
        // Handle Ctrl+C
        if (!terminal.current) return;
        terminal.current.writeln("\r\nProcess interrupted.");
        initPrompt(terminal);
        commandRef.current = "";
        return;
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [toggleTerminal]);

  return (
    <div
      ref={terminalRef}
      className={`fixed bottom-10 left-0 right-0 ${
        isTerminalOpen ? "h-[300px]" : "hidden"
      } w-full p-4 md:p-8 backdrop-blur-md bg-black/50 z-50 scrollbar-none`}
    />
  );
}
