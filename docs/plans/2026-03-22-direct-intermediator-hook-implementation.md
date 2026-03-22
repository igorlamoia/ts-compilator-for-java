# Direct Intermediator Hook Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Replace the `/api/intermediator` request inside the intermediate code hook with a local helper that runs `TokenIterator` directly while preserving the hook’s current result and error behavior.

**Architecture:** Keep the hook public API unchanged. Add an internal helper in `useIntermediatorCode.ts` that mirrors the current API route logic, then update the hook to consume that helper instead of Axios. Verify the behavior with a targeted regression test covering config forwarding and error shaping.

**Tech Stack:** Next.js, React hooks, TypeScript, Vitest, compiler `TokenIterator`

---

### Task 1: Add a regression test for direct intermediate code execution

**Files:**
- Create: `packages/ide/src/tests/integration/hooks/use-intermediator-code.spec.ts`
- Modify: `packages/ide/vitest.hooks.config.ts`

**Step 1: Write the failing test**

Write a hook-level test that mocks editor, toast, router, and keyword context dependencies, then asserts:

- `TokenIterator` is instantiated directly
- `grammar`, `operatorWordMap`, and locale are forwarded
- returned warnings/infos still update `intermediateCode`
- `IssueError` still triggers issue display and error toast handling

**Step 2: Run test to verify it fails**

Run: `npx vitest run --config vitest.hooks.config.ts src/tests/integration/hooks/use-intermediator-code.spec.ts`

Expected: FAIL because the hook still calls Axios instead of the direct helper.

### Task 2: Implement the local intermediator helper

**Files:**
- Modify: `packages/ide/src/hooks/useIntermediatorCode.ts`

**Step 1: Add helper and minimal error normalization**

Add a local async helper inside the hook module that:

- Receives tokens, grammar, operator word config, and locale
- Instantiates `TokenIterator`
- Returns `TIntermediateCodeData`
- Throws `IssueError` unchanged
- Throws `Error` for non-issue failures

**Step 2: Replace Axios usage in `handleIntermediateCodeGeneration`**

Change the hook to call the helper and preserve existing `intermediateCode`, `handleIssues`, toast, and save-file behavior with the smallest possible diff.

**Step 3: Run the targeted test to verify it passes**

Run: `npx vitest run --config vitest.hooks.config.ts src/tests/integration/hooks/use-intermediator-code.spec.ts`

Expected: PASS

### Task 3: Run focused regression verification

**Files:**
- Verify only

**Step 1: Run targeted related tests**

Run: `npx vitest run --config vitest.hooks.config.ts src/tests/integration/hooks/use-intermediator-code.spec.ts src/tests/integration/hooks/use-lexer-analyse.spec.ts src/tests/integration/compiler/run-intermediator.spec.ts src/pages/api/__tests__/intermediator-config.spec.ts`

Expected: PASS
