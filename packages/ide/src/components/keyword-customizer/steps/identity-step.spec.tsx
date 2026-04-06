// @vitest-environment jsdom

import React from "react";
import { act } from "react";
import { createRoot } from "react-dom/client";
import { afterEach, describe, expect, it, vi } from "vitest";
import { IdentityStep } from "./identity-step";

(
  globalThis as typeof globalThis & {
    IS_REACT_ACT_ENVIRONMENT: boolean;
  }
).IS_REACT_ACT_ENVIRONMENT = true;

vi.mock("lucide-react", () => ({
  Atom: () => <span>atom</span>,
  Code: () => <span>code</span>,
  Languages: () => <span>languages</span>,
  Sparkles: () => <span>sparkles</span>,
  SquareTerminal: () => <span>terminal</span>,
}));

describe("IdentityStep", () => {
  afterEach(() => {
    document.body.innerHTML = "";
  });

  it("shows free as the first preset option and omits traditional", () => {
    const container = document.createElement("div");
    document.body.appendChild(container);
    const root = createRoot(container);

    act(() => {
      root.render(
        <IdentityStep
          values={{ selectedPresetId: "free" }}
          actions={{ selectPreset: vi.fn() }}
        />,
      );
    });

    const buttons = Array.from(container.querySelectorAll("button"));
    expect(buttons[0]?.textContent).toContain("Livre");
    expect(container.textContent).not.toContain("Tradicional");

    act(() => {
      root.unmount();
    });
  });
});
