"use client";

import { useEffect, useRef } from "react";
import { Terminal } from "xterm";
import "xterm/css/xterm.css";

interface ITerminalViewProps {
  isTerminalOpen: boolean;
  toggleTerminal: () => void;
}

export default function TerminalView({
  isTerminalOpen,
  toggleTerminal,
}: ITerminalViewProps) {
  const terminalRef = useRef<HTMLDivElement>(null);
  const term = useRef<Terminal | null>(null);
  const commandRef = useRef<string>("");

  function prompt() {
    if (!term.current) return;
    term.current.write("\r\n$ ");
  }

  useEffect(() => {
    if (terminalRef.current && !term.current) {
      term.current = new Terminal({
        cols: 80,
        rows: 14,
        theme: {
          background: "rgba(0, 0, 0, 0)",
        },
      });

      term.current.open(terminalRef.current);
      term.current.writeln("Welcome to the Lamoia's Terminal!");
      prompt();

      // Register the onData listener only once
      term.current.onData((data) => {
        if (!term.current) return;

        if (data === "\r") {
          // Handle enter key
          term.current.writeln(`\r\nExecuted: ${commandRef.current}`);
          commandRef.current = "";
          prompt();
        } else if (data === "\u007F") {
          // Handle backspace
          if (commandRef.current.length > 0) {
            commandRef.current = commandRef.current.slice(0, -1);
            term.current.write("\b \b");
          }
        } else {
          commandRef.current += data;
          term.current.write(data);
        }
      });
    }
  }, []);

  useEffect(() => {
    if (isTerminalOpen && term.current) {
      term.current.focus();
    }
  }, [isTerminalOpen]);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.ctrlKey && ["'", "j"].includes(event.key)) {
        toggleTerminal();
      } else if (event.key === "Escape") {
        toggleTerminal();
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
