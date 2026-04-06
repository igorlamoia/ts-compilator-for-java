# Keyword Customizer Presets Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Refactor the keyword customizer presets into declarative constants, rename the creative preset to python-like, and add a Mineres-like preset using only currently supported customizations.

**Architecture:** Keep preset application centralized in the wizard model. Represent each preset as an explicit constant for labels and lexeme overrides, then consume the same preset ids in the identity step UI and existing preview plumbing.

**Tech Stack:** TypeScript, React, Vitest

---

### Task 1: Cover the new preset contract in tests

**Files:**
- Modify: `packages/ide/src/components/keyword-customizer/wizard-model.spec.ts`

**Step 1: Write the failing test**

Add assertions for:
- `python-like` preserving the previous creative behavior.
- `mineres-like` applying supported Mineres mappings and `statementTerminatorLexeme = "uai"`.
- Label coverage for the new preset ids.

**Step 2: Run test to verify it fails**

Run: `pnpm --filter ide test -- wizard-model.spec.ts`
Expected: FAIL because the new preset ids do not exist yet.

**Step 3: Write minimal implementation**

Update preset ids and application logic only as needed to satisfy the new tests.

**Step 4: Run test to verify it passes**

Run: `pnpm --filter ide test -- wizard-model.spec.ts`
Expected: PASS

### Task 2: Refactor presets into declarative constants

**Files:**
- Modify: `packages/ide/src/components/keyword-customizer/wizard-model.ts`

**Step 1: Write the failing test**

Reuse Task 1 coverage so preset behavior is specified before refactoring.

**Step 2: Run test to verify it fails**

Run: `pnpm --filter ide test -- wizard-model.spec.ts`
Expected: FAIL

**Step 3: Write minimal implementation**

Introduce `ALL_CAPS` preset constants for labels and keyword changes, then replace inline preset conditionals with data-driven application.

**Step 4: Run test to verify it passes**

Run: `pnpm --filter ide test -- wizard-model.spec.ts`
Expected: PASS

### Task 3: Update preset cards in the identity step

**Files:**
- Modify: `packages/ide/src/components/keyword-customizer/steps/identity-step.tsx`

**Step 1: Write the failing test**

Rely on type-checking and targeted rendering behavior already enforced by the preset id union.

**Step 2: Run test to verify it fails**

Run: `pnpm --filter ide test -- wizard-model.spec.ts`
Expected: FAIL until the UI stops referencing removed preset ids.

**Step 3: Write minimal implementation**

Replace `creative` card with `python-like` and add `mineres-like` card content consistent with the new preset behavior.

**Step 4: Run test to verify it passes**

Run: `pnpm --filter ide test -- wizard-model.spec.ts`
Expected: PASS

### Task 4: Verify the targeted behavior

**Files:**
- No code changes required

**Step 1: Run targeted tests**

Run: `pnpm --filter ide test -- wizard-model.spec.ts preview-data.spec.ts`
Expected: PASS

**Step 2: Run broader component tests if needed**

Run: `pnpm --filter ide test -- keyword-customizer`
Expected: PASS or no relevant regressions
