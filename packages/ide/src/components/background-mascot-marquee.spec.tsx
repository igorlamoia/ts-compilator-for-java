// @vitest-environment jsdom

import React from "react";
import { act } from "react";
import { createRoot } from "react-dom/client";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import {
  BACKGROUND_MASCOTS,
  MAX_MASCOT_DELAY_MS,
  MIN_MASCOT_DELAY_MS,
  MASCOT_PASS_DURATION_MS,
  BackgroundMascotMarquee,
  getMascotTraversalDirection,
  getRandomMascotDelay,
  pickNextMascotIndex,
} from "./background-mascot-marquee";

(
  globalThis as typeof globalThis & {
    IS_REACT_ACT_ENVIRONMENT: boolean;
  }
).IS_REACT_ACT_ENVIRONMENT = true;

describe("background-mascot-marquee helpers", () => {
  it("returns a random mascot delay within the configured range", () => {
    expect(getRandomMascotDelay(() => 0)).toBe(MIN_MASCOT_DELAY_MS);
    expect(getRandomMascotDelay(() => 1)).toBe(MAX_MASCOT_DELAY_MS);
  });

  it("does not immediately repeat the current mascot when alternatives exist", () => {
    expect(pickNextMascotIndex(0, 2, () => 0)).toBe(1);
    expect(pickNextMascotIndex(1, 2, () => 0)).toBe(0);
    expect(pickNextMascotIndex(1, 3, () => 0)).not.toBe(1);
  });

  it("alternates traversal direction between cycles", () => {
    expect(getMascotTraversalDirection(0)).toBe("left-to-right");
    expect(getMascotTraversalDirection(1)).toBe("right-to-left");
    expect(getMascotTraversalDirection(2)).toBe("left-to-right");
  });
});

describe("BackgroundMascotMarquee", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.restoreAllMocks();
    document.body.innerHTML = "";
  });

  it("starts with one mascot crossing from left to right", () => {
    const container = document.createElement("div");
    document.body.appendChild(container);
    const root = createRoot(container);

    act(() => {
      root.render(<BackgroundMascotMarquee />);
    });

    const mascot = container.querySelector("[data-background-mascot]");
    const pass = container.querySelector(
      "[data-background-mascot-pass]",
    ) as HTMLDivElement | null;

    expect(mascot).not.toBeNull();
    expect(pass?.className).toContain("animate-background-mascot-left-to-right");
    expect(pass?.className).not.toContain("motion-safe:");
    expect(mascot?.className).toContain("animate-background-mascot-spin");
    expect(mascot?.getAttribute("data-direction")).toBe("left-to-right");
    expect(mascot?.getAttribute("src")).toBe(BACKGROUND_MASCOTS[0]);

    act(() => {
      root.unmount();
    });
  });

  it("waits a random delay after one pass, then starts the next pass from the opposite side", () => {
    vi.spyOn(Math, "random").mockReturnValue(0);

    const container = document.createElement("div");
    document.body.appendChild(container);
    const root = createRoot(container);

    act(() => {
      root.render(<BackgroundMascotMarquee />);
    });

    const firstMascot = container.querySelector(
      "[data-background-mascot]",
    ) as HTMLImageElement | null;
    expect(firstMascot?.dataset.direction).toBe("left-to-right");
    expect(firstMascot?.getAttribute("src")).toBe(BACKGROUND_MASCOTS[0]);

    act(() => {
      vi.advanceTimersByTime(MASCOT_PASS_DURATION_MS);
    });

    expect(container.querySelector("[data-background-mascot]")).toBeNull();

    act(() => {
      vi.advanceTimersByTime(MIN_MASCOT_DELAY_MS);
    });

    const secondMascot = container.querySelector(
      "[data-background-mascot]",
    ) as HTMLImageElement | null;
    expect(secondMascot?.dataset.direction).toBe("right-to-left");
    expect(secondMascot?.getAttribute("src")).toBe(BACKGROUND_MASCOTS[1]);

    act(() => {
      root.unmount();
    });
  });

  it("clears the pending timer on unmount while waiting for the next pass", () => {
    vi.spyOn(Math, "random").mockReturnValue(0);
    const clearTimeoutSpy = vi.spyOn(globalThis, "clearTimeout");

    const container = document.createElement("div");
    document.body.appendChild(container);
    const root = createRoot(container);

    act(() => {
      root.render(<BackgroundMascotMarquee />);
    });

    act(() => {
      vi.advanceTimersByTime(MASCOT_PASS_DURATION_MS);
    });

    act(() => {
      root.unmount();
    });

    expect(clearTimeoutSpy).toHaveBeenCalled();
  });
});
