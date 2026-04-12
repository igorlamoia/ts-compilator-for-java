// @vitest-environment jsdom

import React from "react";
import { act } from "react";
import { createRoot } from "react-dom/client";
import { afterEach, describe, expect, it } from "vitest";
import { OptionCard } from "./option-card";

(
  globalThis as typeof globalThis & {
    IS_REACT_ACT_ENVIRONMENT: boolean;
  }
).IS_REACT_ACT_ENVIRONMENT = true;

describe("OptionCard", () => {
  afterEach(() => {
    document.body.innerHTML = "";
  });

  function renderSelectedCard(iconColor: React.ComponentProps<
    typeof OptionCard
  >["iconColor"]) {
    const container = document.createElement("div");
    document.body.appendChild(container);
    const root = createRoot(container);

    act(() => {
      root.render(
        <OptionCard
          title="Tipos"
          description="Personalize a forma como a linguagem trata tipos."
          iconColor={iconColor}
          selected
        />,
      );
    });

    const button = container.querySelector("button");
    expect(button).not.toBeNull();

    return { button: button as HTMLButtonElement, root };
  }

  it("uses an icon-colored shadow instead of the cyan selection ring", () => {
    const { button, root } = renderSelectedCard("amber");

    expect(button.style.boxShadow).toBe(
      "0 0 0 1px rgba(251, 191, 36, 0.3), 0 0 34px -10px rgba(245, 158, 11, 0.5), 0 22px 48px -30px rgba(2, 6, 23, 0.92)",
    );
    expect(button.className).not.toContain("ring-cyan-400/70");

    act(() => {
      root.unmount();
    });
  });
});
