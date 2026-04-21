// @vitest-environment jsdom

import React from "react";
import { act } from "react";
import { createRoot } from "react-dom/client";
import { afterEach, describe, expect, it } from "vitest";

import { HeroButton } from ".";

(
  globalThis as typeof globalThis & {
    IS_REACT_ACT_ENVIRONMENT: boolean;
  }
).IS_REACT_ACT_ENVIRONMENT = true;

describe("HeroButton", () => {
  afterEach(() => {
    document.body.innerHTML = "";
  });

  it("disables the button and shows a loading indicator when loading", () => {
    const container = document.createElement("div");
    document.body.appendChild(container);
    const root = createRoot(container);

    act(() => {
      root.render(
        <HeroButton type="submit" isLoading>
          Save
        </HeroButton>,
      );
    });

    const button = container.querySelector("button");

    expect(button?.disabled).toBe(true);
    expect(button?.getAttribute("aria-busy")).toBe("true");
    expect(button?.className).not.toContain("opacity-50");
    expect(button?.className).toContain("text-slate-950");
    expect(button?.textContent).toContain("Save");
    expect(container.querySelector('[data-slot="hero-button-spinner"]')).not.toBeNull();

    act(() => {
      root.unmount();
    });
  });
});
