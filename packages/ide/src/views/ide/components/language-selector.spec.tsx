// @vitest-environment jsdom

import React from "react";
import { act } from "react";
import { createRoot } from "react-dom/client";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { getDefaultCustomizationState } from "@/contexts/keyword/KeywordContext";
import { saveSavedKeywordLanguage } from "@/lib/keyword-language-storage";

const useKeywordsMock = vi.fn();

vi.mock("@/contexts/keyword/KeywordContext", async (importOriginal) => {
  const actual =
    await importOriginal<typeof import("@/contexts/keyword/KeywordContext")>();

  return {
    ...actual,
    useKeywords: () => useKeywordsMock(),
  };
});

import { LanguageSelector } from "./language-selector";

(
  globalThis as typeof globalThis & {
    IS_REACT_ACT_ENVIRONMENT: boolean;
  }
).IS_REACT_ACT_ENVIRONMENT = true;

describe("LanguageSelector", () => {
  beforeEach(() => {
    localStorage.clear();
    useKeywordsMock.mockReset();
    useKeywordsMock.mockReturnValue({
      setCustomization: vi.fn(),
    });

    saveSavedKeywordLanguage({
      name: "Didatica Neon",
      slug: "didatica-neon",
      imageUrl: "https://img.example/neon.png",
      imageQuery: "neon code",
      presetId: "didactic-pt",
      customization: {
        ...getDefaultCustomizationState(),
        statementTerminatorLexeme: "fim",
      },
    });
    saveSavedKeywordLanguage({
      name: "Mineres Craft",
      slug: "mineres-craft",
      imageUrl: "https://img.example/mineres.png",
      imageQuery: "craft code",
      presetId: "mineres-like",
      customization: {
        ...getDefaultCustomizationState(),
        statementTerminatorLexeme: "uai",
      },
    });
  });

  afterEach(() => {
    document.body.innerHTML = "";
  });

  it("renders saved language options and reflects the active selection", () => {
    const container = document.createElement("div");
    document.body.appendChild(container);
    const root = createRoot(container);

    act(() => {
      root.render(<LanguageSelector />);
    });

    const select = container.querySelector(
      'select[aria-label="Selecionar linguagem salva"]',
    ) as HTMLSelectElement | null;

    expect(select).toBeInstanceOf(HTMLSelectElement);
    expect(select?.value).toBe("mineres-craft");
    expect(container.textContent).toContain("Didatica Neon");
    expect(container.textContent).toContain("Mineres Craft");

    act(() => {
      root.unmount();
    });
  });

  it("switches the active saved language and applies its customization", () => {
    const container = document.createElement("div");
    document.body.appendChild(container);
    const root = createRoot(container);
    const context = {
      setCustomization: vi.fn(),
    };
    useKeywordsMock.mockReturnValue(context);

    act(() => {
      root.render(<LanguageSelector />);
    });

    const select = container.querySelector(
      'select[aria-label="Selecionar linguagem salva"]',
    ) as HTMLSelectElement | null;
    expect(select).toBeInstanceOf(HTMLSelectElement);

    act(() => {
      const valueSetter = Object.getOwnPropertyDescriptor(
        HTMLSelectElement.prototype,
        "value",
      )?.set;
      valueSetter?.call(select, "didatica-neon");
      select?.dispatchEvent(
        new Event("change", { bubbles: true, cancelable: true }),
      );
    });

    expect(localStorage.getItem("keyword-customization-active")).toBe(
      "didatica-neon",
    );
    expect(context.setCustomization).toHaveBeenCalledWith(
      expect.objectContaining({
        statementTerminatorLexeme: "fim",
      }),
    );

    act(() => {
      root.unmount();
    });
  });
});
