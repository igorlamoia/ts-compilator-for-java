// @vitest-environment jsdom

import React from "react";
import { act } from "react";
import { createRoot } from "react-dom/client";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { TokenCard } from "./token-card";

globalThis.IS_REACT_ACT_ENVIRONMENT = true;

const showLineIssuesMock = vi.fn();
const useRouterMock = vi.fn(() => ({ locale: "pt-BR" }));

vi.mock("@/hooks/useEditor", () => ({
  useEditor: () => ({
    showLineIssues: showLineIssuesMock,
  }),
}));

vi.mock("next/router", () => ({
  useRouter: () => useRouterMock(),
}));

describe("TokenCard", () => {
  beforeEach(() => {
    showLineIssuesMock.mockReset();
    useRouterMock.mockReturnValue({ locale: "pt-BR" });
    window.scrollTo = vi.fn();
  });

  afterEach(() => {
    document.body.innerHTML = "";
  });

  function renderCard(type: number, lexeme: string) {
    const container = document.createElement("div");
    document.body.appendChild(container);
    const root = createRoot(container);

    act(() => {
      root.render(
        <TokenCard
          token={{ column: 1, line: 1, type, lexeme }}
          styles={{ text: "", bg: "", border: "", transform: "" }}
        />,
      );
    });

    return { container, root };
  }

  it("renders translated label for <INDENT>", () => {
    const { container, root } = renderCard(55, "<INDENT>");

    expect(container.textContent).toContain("indentação");
    expect(container.textContent).toContain("<INDENT>");

    act(() => {
      root.unmount();
    });
  });

  it("renders translated label for <DEDENT>", () => {
    const { container, root } = renderCard(56, "<DEDENT>");

    expect(container.textContent).toContain("desindentação");
    expect(container.textContent).toContain("<DEDENT>");

    act(() => {
      root.unmount();
    });
  });
});
