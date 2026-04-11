// @vitest-environment jsdom

import React from "react";
import { act } from "react";
import { createRoot } from "react-dom/client";
import { afterEach, describe, expect, it } from "vitest";
import { CodeScrollArea } from "./code-scroll-area";

(
  globalThis as typeof globalThis & {
    IS_REACT_ACT_ENVIRONMENT: boolean;
  }
).IS_REACT_ACT_ENVIRONMENT = true;

describe("CodeScrollArea", () => {
  afterEach(() => {
    document.body.innerHTML = "";
  });

  it("uses the shared perfect-scrollbar wrapper for horizontally scrollable code", () => {
    const container = document.createElement("div");
    document.body.appendChild(container);
    const root = createRoot(container);

    act(() => {
      root.render(
        <CodeScrollArea className="custom-scroll-area">
          <pre>
            <code>very long code line</code>
          </pre>
        </CodeScrollArea>,
      );
    });

    const scrollArea = container.querySelector(".code-scroll-area");

    expect(scrollArea).not.toBeNull();
    expect(scrollArea?.className).toContain("perfect-scrollbar");
    expect(scrollArea?.className).toContain("perfect-scrollbar-both");
    expect(scrollArea?.className).toContain("overflow-auto");
    expect(scrollArea?.className).toContain("custom-scroll-area");

    act(() => {
      root.unmount();
    });
  });
});
