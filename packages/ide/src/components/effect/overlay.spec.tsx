// @vitest-environment jsdom

import React from "react";
import { act } from "react";
import { createRoot } from "react-dom/client";
import { afterEach, describe, expect, it } from "vitest";
import { Overlay } from "./overlay";

(
  globalThis as typeof globalThis & {
    IS_REACT_ACT_ENVIRONMENT: boolean;
  }
).IS_REACT_ACT_ENVIRONMENT = true;

describe("Overlay", () => {
  afterEach(() => {
    document.body.innerHTML = "";
  });

  it("renders a non-interactive fade from the right edge", () => {
    const container = document.createElement("div");
    document.body.appendChild(container);
    const root = createRoot(container);

    act(() => {
      root.render(<Overlay side="right" />);
    });

    const overlay = container.firstElementChild;

    expect(overlay?.className).toContain("pointer-events-none");
    expect(overlay?.className).toContain("absolute");
    expect(overlay?.className).toContain("inset-y-0");
    expect(overlay?.className).toContain("right-0");
    expect(overlay?.className).toContain("w-44");
    expect(overlay?.className).toContain("bg-linear-to-l");

    act(() => {
      root.unmount();
    });
  });

  it("renders a fade from the left edge", () => {
    const container = document.createElement("div");
    document.body.appendChild(container);
    const root = createRoot(container);

    act(() => {
      root.render(<Overlay side="left" />);
    });

    const overlay = container.firstElementChild;

    expect(overlay?.className).toContain("inset-y-0");
    expect(overlay?.className).toContain("left-0");
    expect(overlay?.className).toContain("w-44");
    expect(overlay?.className).toContain("bg-linear-to-r");

    act(() => {
      root.unmount();
    });
  });

  it("renders fades from both horizontal edges", () => {
    const container = document.createElement("div");
    document.body.appendChild(container);
    const root = createRoot(container);

    act(() => {
      root.render(<Overlay side="x" />);
    });

    const overlays = Array.from(container.children);

    expect(overlays).toHaveLength(2);
    expect(overlays[0].className).toContain("left-0");
    expect(overlays[0].className).toContain("bg-linear-to-r");
    expect(overlays[1].className).toContain("right-0");
    expect(overlays[1].className).toContain("bg-linear-to-l");

    act(() => {
      root.unmount();
    });
  });

  it("renders fades from both horizontal edges by default", () => {
    const container = document.createElement("div");
    document.body.appendChild(container);
    const root = createRoot(container);

    act(() => {
      root.render(<Overlay />);
    });

    const overlays = Array.from(container.children);

    expect(overlays).toHaveLength(2);
    expect(overlays[0].className).toContain("left-0");
    expect(overlays[1].className).toContain("right-0");

    act(() => {
      root.unmount();
    });
  });
});
