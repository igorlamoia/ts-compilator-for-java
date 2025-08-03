"use client";

import { useEffect, useRef } from "react";
import { Terminal } from "xterm";
import { MutableRefObject } from "react";
import "xterm/css/xterm.css";

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
  commandRef: MutableRefObject<string>
) {
  if (!terminal.current) return;
  terminal.current.writeln(`\r\nExecuted: ${commandRef.current}`);
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

      terminal.current.onData((data) => {
        if (!terminal.current) return;

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
                "\r\nAvailable commands: clear, cls, help, exit, ctrl+c to interrupt, ctrl+' to toggle terminal\r\n"
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
          case "\r":
            handleEnter(terminal, commandRef);
            return;
          case "\u007F": // Backspace
            if (commandRef.current.length > 0) {
              commandRef.current = commandRef.current.slice(0, -1);
              terminal.current.write("\b \b");
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
      console.log(event);
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
      className={`
        fixed bottom-10 left-0 right-0
      ${isTerminalOpen ? "h-[300px]" : "hidden"} w-full  p-4 md:p-8
        backdrop-blur-md bg-black/50 z-50
        scrollbar-none
        `}
    />
  );
}
