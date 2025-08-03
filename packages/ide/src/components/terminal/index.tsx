"use client";

import { useTheme } from "@/contexts/ThemeContext";
import { useEffect, useRef } from "react";
import { Terminal } from "xterm";
import "xterm/css/xterm.css";
interface ITerminalViewProps {
  isTerminalOpen: boolean;
}
export default function TerminalView({ isTerminalOpen }: ITerminalViewProps) {
  const terminalRef = useRef<HTMLDivElement>(null);
  const term = useRef<Terminal | null>(null);
  const { darkMode } = useTheme();
  function prompt() {
    if (!term.current) return;
    term.current.write("\r\n$ ");
    let command = "";
    term.current.onData((data) => {
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
          background: "rgba(0, 0, 0, 0.3)",
          // foreground: darkMode ? "white" : "black", // TODO implement the theme switching logic
        },
      });

      term.current.open(terminalRef.current);
      term.current.writeln("Welcome to the Web Terminal!");
      prompt();
    }
  }, []);

  return (
    <div
      ref={terminalRef}
      className={`
        fixed bottom-0 left-0 right-0
      ${
        isTerminalOpen ? "h-[300px]" : "h-0"
      } w-full rounded-md border border-gray-300
        backdrop-blur-md bg-black/50 z-50
        `}
    />
  );
}
