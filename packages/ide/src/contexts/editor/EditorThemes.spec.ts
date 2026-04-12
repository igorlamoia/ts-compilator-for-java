import { describe, expect, it } from "vitest";
import { DarkTheme, LightTheme } from "./EditorThemes";

describe("EditorThemes", () => {
  it("styles operators in the dark theme", () => {
    expect(DarkTheme.rules).toContainEqual(
      expect.objectContaining({
        token: "operator",
        fontStyle: "bold",
      }),
    );
  });

  it("styles operators in the light theme", () => {
    expect(LightTheme.rules).toContainEqual(
      expect.objectContaining({
        token: "operator",
        fontStyle: "bold",
      }),
    );
  });

  it("styles delimiters in the dark theme", () => {
    expect(DarkTheme.rules).toContainEqual(
      expect.objectContaining({
        token: "delimiter",
        fontStyle: "bold",
      }),
    );
  });

  it("styles block delimiters in the dark theme", () => {
    expect(DarkTheme.rules).toContainEqual(
      expect.objectContaining({
        token: "keyword.blockDelimiter",
        fontStyle: "bold",
      }),
    );
  });

  it("styles delimiters in the light theme", () => {
    expect(LightTheme.rules).toContainEqual(
      expect.objectContaining({
        token: "delimiter",
        fontStyle: "bold",
      }),
    );
  });

  it("styles block delimiters in the light theme", () => {
    expect(LightTheme.rules).toContainEqual(
      expect.objectContaining({
        token: "keyword.blockDelimiter",
        fontStyle: "bold",
      }),
    );
  });
});
