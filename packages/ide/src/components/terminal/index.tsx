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

  function prompt() {
    if (!term.current) return;
    term.current.write("\r\n$ ");
    let command = "";
    term.current.onData((data) => {
      // console.log("data:", data);
      if (data === "\r") {
        term.current?.writeln(`\r\nExecuted: ${command}`);
        command = "";
        prompt();
      } else if (data === "\u007F") {
        // handle backspace
        if (command.length > 0) {
          command = command.slice(0, -1);
          term.current?.write("\b \b");
        }
      } else {
        command += data;
        term.current?.write(data);
      }
    });
  }

  useEffect(() => {
    if (terminalRef.current && !term.current) {
      term.current = new Terminal({
        cols: 80,
        rows: 20,
        theme: {
          background: "rgba(0, 0, 0, 0)",
          // foreground: darkMode ? "white" : "black", // TODO implement the theme switching logic
        },
      });

      term.current.open(terminalRef.current);
      term.current.writeln("Welcome to the Lamoia's Terminal!");
      prompt();
    }
  }, []);

  useEffect(() => {
    if (isTerminalOpen && term.current) {
      term.current.focus();
    }
  }, [isTerminalOpen]);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      console.log(event);
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
        fixed bottom-0 left-0 right-0
      ${isTerminalOpen ? "h-[300px]" : "h-0"} w-full  p-4 md:p-8
        backdrop-blur-md bg-black/50 z-50
        scrollbar-none
        `}
    />
  );
}
