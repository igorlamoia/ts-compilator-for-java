# IDE Keycustomizer Semicolon + Block Mode Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Expose compiler semicolon mode and block mode in IDE keycustomizer, persist choices, and propagate them through lexer/intermediate/submission APIs so behavior is consistent end-to-end.

**Architecture:** Extend existing `KeywordContext` to become the single source of compiler customization payload (`keywordMap`, optional `blockDelimiters`, `indentationBlock`, `grammar`). Update keycustomizer UI with two new settings and wire all API request/handler touchpoints to forward/use these fields. Keep backward compatibility for existing localStorage data.

**Tech Stack:** Next.js (Pages Router), React 19, TypeScript, existing IDE API routes, compiler `Lexer` and `TokenIterator` config surfaces.

---

### Task 1: Add Shared IDE Compiler Config Types

**Files:**
- Create: `packages/ide/src/entities/compiler-config.ts`
- Modify: `packages/ide/src/contexts/KeywordContext.tsx`
- Modify: `packages/ide/src/pages/api/lexer.ts`
- Modify: `packages/ide/src/pages/api/intermediator.ts`
- Modify: `packages/ide/src/pages/api/submissions/validate.ts`

**Step 1: Write the failing test**

Create `packages/ide/src/entities/compiler-config.ts` imports in the three API routes and context before the file exists.

```ts
import type { IDEGrammarConfig } from "@/entities/compiler-config";
```

**Step 2: Run test to verify it fails**

Run: `npm run lint --workspace @ts-compilator-for-java/ide`
Expected: FAIL with `Cannot find module '@/entities/compiler-config'` in routes/context.

**Step 3: Write minimal implementation**

Create `compiler-config.ts` with shared types:

```ts
export type IDESemicolonMode = "optional-eol" | "required";
export type IDEBlockMode = "delimited" | "indentation";

export type IDEGrammarConfig = {
  semicolonMode: IDESemicolonMode;
  blockMode: IDEBlockMode;
};

export type IDECompilerConfigPayload = {
  keywordMap: Record<string, number>;
  blockDelimiters?: { open: string; close: string };
  indentationBlock: boolean;
  grammar: IDEGrammarConfig;
};
```

**Step 4: Run test to verify it passes**

Run: `npm run lint --workspace @ts-compilator-for-java/ide`
Expected: PASS for missing-module errors.

**Step 5: Commit**

```bash
git add packages/ide/src/entities/compiler-config.ts \
  packages/ide/src/contexts/KeywordContext.tsx \
  packages/ide/src/pages/api/lexer.ts \
  packages/ide/src/pages/api/intermediator.ts \
  packages/ide/src/pages/api/submissions/validate.ts
git commit -m "refactor(ide): add shared compiler config payload types"
```

### Task 2: Extend KeywordContext State, Persistence, and Payload Builder

**Files:**
- Modify: `packages/ide/src/contexts/KeywordContext.tsx`

**Step 1: Write the failing test**

Add temporary strict typing in context return usage to require new fields (`semicolonMode`, `blockMode`, `grammar` in `buildLexerConfig` return), then run lint/type checks.

```ts
const cfg = buildLexerConfig();
cfg.grammar.semicolonMode;
cfg.grammar.blockMode;
```

**Step 2: Run test to verify it fails**

Run: `npm run lint --workspace @ts-compilator-for-java/ide`
Expected: FAIL because `KeywordContext` does not expose the new fields and payload shape.

**Step 3: Write minimal implementation**

In `KeywordContext.tsx`:
- Extend stored customization with:
  - `semicolonMode` defaulting to `"optional-eol"`
  - `blockMode` defaulting to `"delimited"`
- Add state + setters to context value.
- Update load/hydration logic to safely default missing legacy values.
- Update reset behavior to restore new defaults.
- Update `buildLexerConfig()` to return `IDECompilerConfigPayload`:
  - always include `grammar`
  - set `indentationBlock = blockMode === "indentation"`
  - include `blockDelimiters` only when `blockMode === "delimited"` and valid.

**Step 4: Run test to verify it passes**

Run: `npm run lint --workspace @ts-compilator-for-java/ide`
Expected: PASS for context typing and payload shape.

**Step 5: Commit**

```bash
git add packages/ide/src/contexts/KeywordContext.tsx
git commit -m "feat(ide): persist semicolon and block mode in keyword context"
```

### Task 3: Add Keycustomizer Controls for Semicolon and Block Mode

**Files:**
- Modify: `packages/ide/src/components/keyword-customizer.tsx`
- Modify: `packages/ide/src/contexts/KeywordContext.tsx`

**Step 1: Write the failing test**

Add references in UI to new context fields before wiring them:

```tsx
const { semicolonMode, blockMode, setSemicolonMode, setBlockMode } = useKeywords();
```

and render radio controls using those values.

**Step 2: Run test to verify it fails**

Run: `npm run lint --workspace @ts-compilator-for-java/ide`
Expected: FAIL with missing properties from `useKeywords()`.

**Step 3: Write minimal implementation**

In modal UI:
- Add semicolon mode control (Optional/Required).
- Add block mode control (Block delimiters/Indentation).
- Keep delimiter fields visible.
- Disable delimiter inputs when `blockMode === "indentation"`.
- Suppress delimiter validation error when block mode is indentation.
- Save handler:
  - validate delimiters only when `delimited`
  - persist `semicolonMode` + `blockMode` with draft data.
- Reset handler returns new defaults.

**Step 4: Run test to verify it passes**

Run: `npm run lint --workspace @ts-compilator-for-java/ide`
Expected: PASS and no unused/missing state warnings.

**Step 5: Commit**

```bash
git add packages/ide/src/components/keyword-customizer.tsx \
  packages/ide/src/contexts/KeywordContext.tsx
git commit -m "feat(ide): add semicolon and block mode controls to keycustomizer"
```

### Task 4: Forward New Config From Client Hooks and Pages

**Files:**
- Modify: `packages/ide/src/hooks/useLexerAnalyse.ts`
- Modify: `packages/ide/src/hooks/useIntermediatorCode.ts`
- Modify: `packages/ide/src/pages/exercises/workspace.tsx`

**Step 1: Write the failing test**

Add request payload fields in callers:

```ts
indentationBlock: lexerConfig.indentationBlock,
grammar: lexerConfig.grammar,
```

before APIs accept them.

**Step 2: Run test to verify it fails**

Run: `npm run build --workspace @ts-compilator-for-java/ide`
Expected: FAIL or type warnings where payload/route typings are incomplete.

**Step 3: Write minimal implementation**

- `useLexerAnalyse`: send `indentationBlock` + `grammar` to `/lexer`.
- `useIntermediatorCode`: accept `grammar` argument in `handleIntermediateCodeGeneration(tokens, grammar)` and send to `/intermediator`.
- Update call site where intermediate generation is triggered to pass `buildLexerConfig().grammar`.
- `workspace.tsx`: send `indentationBlock` + `grammar` to `/submissions/validate`.

**Step 4: Run test to verify it passes**

Run: `npm run build --workspace @ts-compilator-for-java/ide`
Expected: PASS.

**Step 5: Commit**

```bash
git add packages/ide/src/hooks/useLexerAnalyse.ts \
  packages/ide/src/hooks/useIntermediatorCode.ts \
  packages/ide/src/pages/exercises/workspace.tsx
git commit -m "feat(ide): send grammar and indentation config in compiler requests"
```

### Task 5: Update API Routes to Apply Grammar + Indentation Config

**Files:**
- Modify: `packages/ide/src/pages/api/lexer.ts`
- Modify: `packages/ide/src/pages/api/intermediator.ts`
- Modify: `packages/ide/src/pages/api/submissions/validate.ts`

**Step 1: Write the failing test**

Add route-level typed body destructuring for new fields:

```ts
const { grammar, indentationBlock } = req.body;
```

and pass into constructors before importing proper shared types.

**Step 2: Run test to verify it fails**

Run: `npm run build --workspace @ts-compilator-for-java/ide`
Expected: FAIL due to incompatible constructor/body typings.

**Step 3: Write minimal implementation**

- In `/api/lexer.ts`:
  - read `indentationBlock`, `grammar` from request body
  - call `new Lexer(sourceCode, { ..., indentationBlock })`
- In `/api/intermediator.ts`:
  - read `grammar`
  - call `new TokenIterator(tokens, { locale, grammar })`
- In `/api/submissions/validate.ts`:
  - include `indentationBlock` in lexer config
  - include `grammar` in `TokenIterator` config
- Keep existing keyword-map merge behavior unchanged.

**Step 4: Run test to verify it passes**

Run: `npm run build --workspace @ts-compilator-for-java/ide`
Expected: PASS.

**Step 5: Commit**

```bash
git add packages/ide/src/pages/api/lexer.ts \
  packages/ide/src/pages/api/intermediator.ts \
  packages/ide/src/pages/api/submissions/validate.ts
git commit -m "feat(ide-api): wire semicolon and block mode into lexer and parser"
```

### Task 6: End-to-End Verification and Regression Checks

**Files:**
- No source changes required unless regressions appear.

**Step 1: Write the failing test**

Manual reproduction cases in IDE:

1. Set semicolon `required`, run code missing `;` at end-of-line.
2. Set semicolon `optional`, run same code.
3. Set block mode `indentation`, run brace-based code.
4. Set block mode `indentation`, run indentation-based code.
5. Submit exercise in each mode and compare compile result to IDE run result.

**Step 2: Run test to verify it fails**

Expected initial failures before final wiring (from previous tasks):
- strict semicolon not enforced consistently
- indentation mode not propagated to submission validation.

**Step 3: Write minimal implementation**

Apply only targeted fixes discovered during manual verification.

**Step 4: Run test to verify it passes**

Run:
- `npm run lint --workspace @ts-compilator-for-java/ide`
- `npm run build --workspace @ts-compilator-for-java/ide`
- manual cases above in local IDE

Expected: lint/build PASS and behavior consistent across lexer/intermediator/submission flows.

**Step 5: Commit**

```bash
git add packages/ide
git commit -m "test(ide): verify configurable semicolon and block mode end-to-end"
```

### Task 7: Docs Update for New IDE Config Surface

**Files:**
- Modify: `packages/ide/README.md`

**Step 1: Write the failing test**

Add checklist expectation that README mentions new keycustomizer options and behavior matrix.

**Step 2: Run test to verify it fails**

Run: `rg -n "semicolon|indentation|block mode|keycustomizer" packages/ide/README.md`
Expected: Missing or incomplete mention of the new settings.

**Step 3: Write minimal implementation**

Document:
- semicolon mode options
- block mode options
- delimiter disable behavior in indentation mode
- consistency across run/compile/submission APIs.

**Step 4: Run test to verify it passes**

Run: `rg -n "semicolon|indentation|block mode|keycustomizer" packages/ide/README.md`
Expected: matches present.

**Step 5: Commit**

```bash
git add packages/ide/README.md
git commit -m "docs(ide): document semicolon and block mode customization"
```
