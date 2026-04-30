# Preview Card Snap Stack Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Build card-by-card category navigation in the keyword preview panel with top and right icon controls.

**Architecture:** Add a preview-specific `CardSnapStack` component that owns active-card state and scroll alignment. Keep `PerfectScrollbar` as the scroll container, but intercept wheel input so each gesture moves one card.

**Tech Stack:** TypeScript, React, Vitest, jsdom, Tailwind CSS, lucide-react

---

### Task 1: Add failing interaction coverage

**Files:**
- Modify: `packages/ide/src/components/keyword-customizer/preview-panel.spec.tsx`

**Step 1: Write the failing test**

Add assertions that the preview panel renders top and right icon controls, marks the first category active, and changes the active category when a card or icon is clicked.

**Step 2: Run test to verify it fails**

Run: `npx vitest run packages/ide/src/components/keyword-customizer/preview-panel.spec.tsx --environment jsdom`
Expected: FAIL because the new controls and active-card state do not exist.

### Task 2: Implement CardSnapStack

**Files:**
- Create: `packages/ide/src/components/keyword-customizer/preview-panel/card-snap-stack.tsx`
- Modify: `packages/ide/src/components/keyword-customizer/preview-panel/index.tsx`

**Step 1: Write minimal implementation**

Create `CardSnapStack` with top icon nav, right overlay nav, focus state, card click handling, wheel handling, and `PerfectScrollbar` wrapping the cards.

**Step 2: Run targeted test**

Run: `npx vitest run packages/ide/src/components/keyword-customizer/preview-panel.spec.tsx --environment jsdom`
Expected: PASS.

### Task 3: Verify focused helper behavior

**Files:**
- Create: `packages/ide/src/components/keyword-customizer/preview-panel/card-snap-stack.spec.ts`

**Step 1: Write tests for index resolution**

Cover next, previous, and boundary behavior.

**Step 2: Run targeted tests**

Run: `npx vitest run packages/ide/src/components/keyword-customizer/preview-panel.spec.tsx packages/ide/src/components/keyword-customizer/preview-panel/card-snap-stack.spec.ts --environment jsdom`
Expected: PASS.
