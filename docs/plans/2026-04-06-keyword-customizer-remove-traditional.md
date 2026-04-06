# Keyword Customizer Remove Traditional Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Remove the `traditional` preset and make `free` the first visible option in the keyword customizer identity step.

**Architecture:** Update the preset union and labels in `wizard-model.ts`, keep the reset behavior on `free`, and reorder the identity-step preset metadata so the UI starts from `Livre`.

**Tech Stack:** TypeScript, React, Vitest

---

### Task 1: Lock the preset-set change in tests

**Files:**
- Modify: `packages/ide/src/components/keyword-customizer/wizard-model.spec.ts`
- Modify: `packages/ide/src/components/keyword-customizer.spec.tsx`

**Step 1: Write the failing test**

Remove `traditional` expectations and update the preset interaction test to use only presets that still exist, with `free` remaining the reset option.

**Step 2: Run test to verify it fails**

Run: `npx vitest run src/components/keyword-customizer/wizard-model.spec.ts`
Expected: FAIL because production code still exposes `traditional`.

**Step 3: Write minimal implementation**

Update the preset model and identity-step metadata to match the new contract.

**Step 4: Run test to verify it passes**

Run: `npx vitest run src/components/keyword-customizer/wizard-model.spec.ts`
Expected: PASS
