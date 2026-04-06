// @vitest-environment jsdom

import React from "react";
import { act } from "react";
import { createRoot } from "react-dom/client";
import { afterEach, describe, expect, it, vi } from "vitest";
import { PreviewPanel } from "./preview-panel";

(
  globalThis as typeof globalThis & {
    IS_REACT_ACT_ENVIRONMENT: boolean;
  }
).IS_REACT_ACT_ENVIRONMENT = true;

vi.mock("./example-snippet", () => ({
  ExampleSnippet: ({ title }: { title: string }) => <div>{title}</div>,
}));

vi.mock("./token-preview", () => ({
  TokenPreview: () => <div>Tokens</div>,
}));

describe("PreviewPanel", () => {
  afterEach(() => {
    document.body.innerHTML = "";
  });

  it("groups changed lexemes by semantic category and hides empty groups", () => {
    const container = document.createElement("div");
    document.body.appendChild(container);
    const root = createRoot(container);

    act(() => {
      root.render(
        <PreviewPanel
          preview={{
            languageLabel: "Ruby-like",
            basedOnLabel: "Ruby-like",
            languageImageUrl: "",
            dna: [],
            baselineSnippet: "",
            snippet: "",
            tokenPreview: [],
            chosenLexemes: [
              { original: "int", custom: "num" },
              { original: "print", custom: "puts" },
              { original: "if", custom: "if_then" },
              { original: "for", custom: "for_each" },
              { original: "return", custom: "return_value" },
              { original: "and", custom: "and_word" },
              { original: "true", custom: "true_word" },
              { original: "{", custom: "inicio" },
              { original: ";", custom: "." },
            ],
          }}
        />,
      );
    });

    const text = container.textContent ?? "";
    const categoryTitles = Array.from(
      container.querySelectorAll("[data-preview-category]"),
    ).map((node) => node.textContent?.trim());

    expect(categoryTitles).toEqual([
      "Tipos e Declaracoes",
      "Entrada/Saida",
      "Condicionais",
      "Lacos",
      "Fluxo",
      "Operadores",
      "Booleanos",
      "Estrutura",
    ]);

    expect(text).toContain("int");
    expect(text).toContain("num");
    expect(text).toContain("print");
    expect(text).toContain("puts");
    expect(text).toContain("if");
    expect(text).toContain("if_then");
    expect(text).toContain("for");
    expect(text).toContain("for_each");
    expect(text).toContain("return");
    expect(text).toContain("return_value");
    expect(text).toContain("and");
    expect(text).toContain("and_word");
    expect(text).toContain("true");
    expect(text).toContain("true_word");
    expect(text).toContain("{");
    expect(text).toContain("inicio");
    expect(text).toContain(";");
    expect(text).toContain(".");
    expect(text).not.toContain("Outros");

    act(() => {
      root.unmount();
    });
  });
});
