// @vitest-environment jsdom

import type { Instruction } from "@ts-compilator-for-java/compiler/interpreter/constants";
import { StrictMode, createRef } from "react";
import { act } from "react";
import { createRoot } from "react-dom/client";
import { afterEach, describe, expect, it, vi } from "vitest";

const executeMock = vi.fn(async () => undefined);

vi.mock("@ts-compilator-for-java/compiler/interpreter", () => ({
  Interpreter: class Interpreter {
    execute = executeMock;
  },
  RuntimeError: class RuntimeError extends Error {
    instructionPointer = 0;
  },
}));

vi.mock("motion/react", () => ({
  motion: {
    div: ({ children, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
      <div {...props}>{children}</div>
    ),
  },
}));

import { Body } from "./body";
import { RuntimeErrorProvider } from "@/contexts/RuntimeErrorContext";

globalThis.IS_REACT_ACT_ENVIRONMENT = true;

describe("Body", () => {
  afterEach(() => {
    executeMock.mockClear();
    document.body.innerHTML = "";
  });

  it("runs the interpreter only once on the first strict-mode mount", async () => {
    const container = document.createElement("div");
    document.body.appendChild(container);
    const root = createRoot(container);

    await act(async () => {
      root.render(
        <StrictMode>
          <RuntimeErrorProvider>
            <Body
              lines={[]}
              currentInput=""
              inputRef={createRef<HTMLInputElement>()}
              setCurrentInput={vi.fn()}
              intermediateCode={[{} as Instruction]}
              setIsExecuting={vi.fn()}
              setLines={vi.fn()}
              toggleTerminal={vi.fn()}
            />
          </RuntimeErrorProvider>
        </StrictMode>,
      );
    });

    expect(executeMock).toHaveBeenCalledTimes(1);

    await act(async () => {
      root.unmount();
    });
  });
});
