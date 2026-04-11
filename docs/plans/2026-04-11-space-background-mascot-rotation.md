# Space Background Mascot Marquee Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Add a dedicated background mascot marquee component that sends one PNG across the screen at a time, alternating left-to-right and right-to-left passes with a randomized `2s` to `5s` idle delay between passes, while the mascot image itself rotates slowly.

**Architecture:** Keep the marquee behavior in `packages/ide/src/components/background-mascot-marquee.tsx`, with the horizontal travel animation on the pass wrapper and the slow rotation on the inner `<img>`. `SpaceBackground` remains a composition root that renders the marquee component alongside `Meteors` and `Particles`.

**Tech Stack:** TypeScript, React, Tailwind CSS, Vitest

---

### Task 1: Lock the marquee timing and direction rules in tests

**Files:**
- Create: `packages/ide/src/components/background-mascot-marquee.spec.tsx`
- Create: `packages/ide/src/components/background-mascot-marquee.tsx`

**Step 1: Write the failing test**

Add tests for:
- `pickNextMascotIndex(currentIndex, total)` does not return the current index when `total > 1`
- `getRandomMascotDelay()` returns a delay inside the `2000..5000` range
- direction alternates between cycles
- the component schedules a future cycle and clears the timer on unmount

Use fake timers and keep the assertions narrow and deterministic.

**Step 2: Run test to verify it fails**

Run: `npx vitest run src/components/background-mascot-marquee.spec.tsx`
Expected: FAIL because the marquee helpers and scheduling behavior do not exist yet.

**Step 3: Write minimal implementation**

Export or co-locate only the minimal helpers required by the tests:
- a bounded random delay helper
- a next-index helper with no immediate repeat when alternatives exist
- a direction toggle helper or equivalent cycle logic
- enough component logic to schedule and clean up one timeout

**Step 4: Run test to verify it passes**

Run: `npx vitest run src/components/background-mascot-marquee.spec.tsx`
Expected: PASS

### Task 2: Implement the dedicated marquee component

**Files:**
- Modify: `packages/ide/src/components/background-mascot-marquee.tsx`

**Step 1: Write the failing test**

Extend `background-mascot-marquee.spec.tsx` to assert:
- the first cycle can start with a mascot entering from the left
- after finishing one pass, the next cycle enters from the opposite side
- only one mascot is rendered at a time
- advancing timers can trigger the next pass with another asset

**Step 2: Run test to verify it fails**

Run: `npx vitest run src/components/background-mascot-marquee.spec.tsx`
Expected: FAIL because the marquee motion model still does not exist.

**Step 3: Write minimal implementation**

Implement `BackgroundMascotMarquee` to:
- define `BACKGROUND_MASCOTS = ["/images/cb.png", "/images/ein.png"]`
- track the active image index in local state
- track the active direction in local state
- move a single mascot fully across the viewport
- wait a random `2000..5000` ms between passes
- prevent overlap by rendering only one pass at a time
- keep `pointer-events-none` on the mascot layer
- keep the mascot subtle in opacity and placement

Prefer a clear two-phase state machine: `waiting` and `moving`.

**Step 4: Run test to verify it passes**

Run: `npx vitest run src/components/background-mascot-marquee.spec.tsx`
Expected: PASS

### Task 3: Integrate the marquee component into SpaceBackground

**Files:**
- Modify: `packages/ide/src/components/space-background.tsx`
- Modify: `packages/ide/src/components/background-mascot-marquee.tsx`
- Modify: `packages/ide/src/styles/globals.css`

**Step 1: Write the failing test**

Add coverage or assertions for:
- `SpaceBackground` renders `BackgroundMascotMarquee` alongside `Meteors` and `Particles`
- reduced-motion mode selecting a simpler motion path
- class or style hooks that keep the mascot visually subtle and background-only

If full reduced-motion emulation is awkward in jsdom, keep the test focused on the helper or class selection logic and verify the final visual output manually.

**Step 2: Run test to verify it fails**

Run: `npx vitest run src/components/background-mascot-marquee.spec.tsx`
Expected: FAIL until the integration and reduced-motion handling exist.

**Step 3: Write minimal implementation**

Implement:
- `SpaceBackground` as a simple composition root using the new component
- a reduced-motion branch that simplifies movement without adding extra decorative transforms
- responsive sizing and vertical placement so the mascot stays out of the primary content area
- any small shared keyframes or utility styles in `globals.css` only if Tailwind utilities are not enough

Keep the result subtle in both light and dark themes.

**Step 4: Run test to verify it passes**

Run: `npx vitest run src/components/background-mascot-marquee.spec.tsx`
Expected: PASS

### Task 4: Add slow inner-image rotation without breaking marquee travel

**Files:**
- Modify: `packages/ide/src/components/background-mascot-marquee.tsx`
- Modify: `packages/ide/src/components/background-mascot-marquee.spec.tsx`
- Modify: `packages/ide/src/styles/globals.css`

**Step 1: Write the failing test**

Extend `background-mascot-marquee.spec.tsx` to assert:
- the pass wrapper keeps the left/right travel class
- the inner image receives a separate slow-rotation class
- reduced-motion mode can disable the extra rotation without removing the pass wrapper

**Step 2: Run test to verify it fails**

Run: `npx vitest run src/components/background-mascot-marquee.spec.tsx`
Expected: FAIL until the inner-image rotation layer exists.

**Step 3: Write minimal implementation**

Implement:
- a new slow-spin keyframe or class in `globals.css`
- a rotation class applied to the inner mascot `<img>`
- reduced-motion handling that disables only the extra spin

Do not move the horizontal pass transform onto the same node as the spin.

**Step 4: Run test to verify it passes**

Run: `npx vitest run src/components/background-mascot-marquee.spec.tsx`
Expected: PASS

### Task 5: Verify the marquee integration locally

**Files:**
- No code changes required

**Step 1: Run targeted tests**

Run: `npx vitest run src/components/background-mascot-marquee.spec.tsx`
Expected: PASS

**Step 2: Run lint on touched files**

Run: `npx eslint src/components/background-mascot-marquee.tsx src/components/background-mascot-marquee.spec.tsx src/components/space-background.tsx src/styles/globals.css`
Expected: PASS for the touched files.

**Step 3: Run type-check**

Run: `npx tsc --noEmit`
Expected: no new errors from the marquee and `space-background` files; existing unrelated package errors may remain.

**Step 4: Manual browser verification**

Check in the browser that:
- only one mascot pass is visible at a time
- the first pass can enter from the left and exit to the right
- the next pass enters from the right and exits to the left
- the idle gap between passes feels random within the `2s` to `5s` window
- the image rotates slowly during each pass
- the mascot stays behind content on desktop and mobile
- reduced-motion behavior is acceptable if enabled
