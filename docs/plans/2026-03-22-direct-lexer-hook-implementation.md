# Direct Lexer Hook Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Replace the `/api/lexer` request inside the lexer hook with a local helper that runs `Lexer` directly while preserving the hook’s current result and error behavior.

**Architecture:** Keep the hook public API unchanged. Add an internal helper in `useLexerAnalyse.ts` that mirrors the current API route logic, then update the hook to consume that helper instead of Axios. Verify the behavior with a targeted regression test covering config forwarding and error shaping.

**Tech Stack:** Next.js, React hooks, TypeScript, Vitest, compiler `Lexer`

---

### Task 1: Add a regression test for direct lexer execution

**Files:**
- Create: `packages/ide/src/hooks/useLexerAnalyse.spec.tsx`
- Modify: `packages/ide/src/hooks/useLexerAnalyse.ts`

**Step 1: Write the failing test**

Write a hook-level test that mocks editor, toast, router, and keyword context dependencies, then asserts:

- `Lexer` is instantiated directly
- `operatorWordMap`, `blockDelimiters`, `indentationBlock`, and locale are forwarded
- returned warnings/infos still update `analyseData`
- `IssueError` still triggers issue display and error toast handling

**Step 2: Run test to verify it fails**

Run: `npm --workspace packages/ide test -- useLexerAnalyse.spec.tsx`

Expected: FAIL because the hook still calls Axios instead of the direct helper.

### Task 2: Implement the local lexer helper

**Files:**
- Modify: `packages/ide/src/hooks/useLexerAnalyse.ts`

**Step 1: Add helper and minimal error normalization**

Add a local async helper inside the hook module that:

- Receives source code, lexer config, and locale
- Uses `buildEffectiveKeywordMap`
- Instantiates `Lexer`
- Returns `TLexerAnalyseData`
- Throws `IssueError` unchanged
- Throws `Error` for non-issue failures

**Step 2: Replace Axios usage in `handleRun`**

Change `handleRun` to call the helper and preserve existing `analyseData`, `handleIssues`, toast, and save-file behavior with the smallest possible diff.

**Step 3: Run the targeted test to verify it passes**

Run: `npm --workspace packages/ide test -- useLexerAnalyse.spec.tsx`

Expected: PASS

### Task 3: Run focused regression verification

**Files:**
- Verify only

**Step 1: Run targeted related tests**

Run: `npm --workspace packages/ide test -- run-lexer.spec.ts lexer-config.spec.ts useLexerAnalyse.spec.tsx`

Expected: PASS
