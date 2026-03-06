# IDE Keyword Map Merge (Switch + Submission API) Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Make IDE keyword customization include `switch/case/default` and ensure backend compilation endpoints merge frontend overrides with default grammar so missing mappings never break compilation.

**Architecture:** Frontend remains per-user (localStorage) and sends optional `keywordMap` overrides. Backend computes an effective keyword map by merging canonical `TOKENS.RESERVEDS` with request overrides, then passes it to the compiler lexer. This keeps defaults always available while allowing frontend to override specific keys.

**Tech Stack:** Next.js API routes, React context/hooks, TypeScript, Zod, compiler package (`@ts-compilator-for-java/compiler`).

---

### Task 1: Add switch/case/default to frontend customizable keywords

**Files:**
- Modify: `packages/ide/src/contexts/KeywordContext.tsx`
- Modify: `packages/ide/src/components/keyword-customizer.tsx`

**Step 1: Write the failing test (manual/behavioral expectation)**

Expected behavior:
- `ORIGINAL_KEYWORDS` includes `switch`, `case`, `default`.
- Keyword customizer UI asks customization questions for those three.

**Step 2: Run check to verify current behavior fails expectation**

Run: `rg -n "switch|case|default" packages/ide/src/contexts/KeywordContext.tsx packages/ide/src/components/keyword-customizer.tsx`
Expected: no entries in customizable list/explanations.

**Step 3: Write minimal implementation**

```ts
const CUSTOMIZABLE_KEYWORDS: Record<string, number> = {
  // ...existing
  switch: 50,
  case: 51,
  default: 52,
};
```

```ts
const KEYWORD_EXPLANATIONS: Record<string, string> = {
  // ...existing
  switch: "Seleciona um bloco para executar com base em uma expressão.",
  case: "Define uma opção específica dentro do switch.",
  default: "Bloco executado quando nenhum case corresponde.",
};
```

**Step 4: Run check to verify it passes**

Run: `rg -n "switch|case|default" packages/ide/src/contexts/KeywordContext.tsx packages/ide/src/components/keyword-customizer.tsx`
Expected: entries found in both files.

**Step 5: Commit**

```bash
git add packages/ide/src/contexts/KeywordContext.tsx \
  packages/ide/src/components/keyword-customizer.tsx
git commit -m "feat(ide): add switch/case/default to keyword customizer"
```

### Task 2: Send keywordMap on submission validation request

**Files:**
- Modify: `packages/ide/src/pages/exercises/workspace.tsx`

**Step 1: Write the failing test (manual/behavioral expectation)**

Expected behavior:
- `POST /submissions/validate` payload includes `keywordMap` built from current user mappings.

**Step 2: Verify current code fails expectation**

Run: `rg -n "submissions/validate|keywordMap|buildKeywordMap" packages/ide/src/pages/exercises/workspace.tsx`
Expected: request exists without `keywordMap` and no `buildKeywordMap` usage.

**Step 3: Write minimal implementation**

```ts
import { useKeywords } from "@/contexts/KeywordContext";

const { buildKeywordMap } = useKeywords();

await api.post("/submissions/validate", {
  exerciseId: exercise.id,
  sourceCode: code,
  keywordMap: buildKeywordMap(),
});
```

**Step 4: Verify request payload update**

Run: `rg -n "submissions/validate|keywordMap|buildKeywordMap" packages/ide/src/pages/exercises/workspace.tsx`
Expected: `keywordMap` is present in request body.

**Step 5: Commit**

```bash
git add packages/ide/src/pages/exercises/workspace.tsx
git commit -m "feat(ide): send keyword map in submission validation requests"
```

### Task 3: Merge frontend keywordMap with backend defaults in /api/lexer

**Files:**
- Modify: `packages/ide/src/pages/api/lexer.ts`

**Step 1: Write failing test case (API behavior spec)

Expected behavior:
- If `req.body.keywordMap` is undefined/partial, lexer still recognizes default reserved words.

**Step 2: Verify current implementation fails expectation**

Run: `sed -n '1,220p' packages/ide/src/pages/api/lexer.ts`
Expected: code passes raw `keywordMap` directly to `Lexer`.

**Step 3: Write minimal implementation**

```ts
import { TOKENS } from "@ts-compilator-for-java/compiler/src/token/constants";

const requestKeywordMap = req.body.keywordMap as KeywordMap | undefined;
const effectiveKeywordMap: KeywordMap = {
  ...(TOKENS.RESERVEDS as KeywordMap),
  ...(requestKeywordMap ?? {}),
};

const lexer = new Lexer(req.body.sourceCode, effectiveKeywordMap, locale);
```

Optional guard (YAGNI-safe): sanitize invalid entries before merge.

**Step 4: Verify implementation is present**

Run: `rg -n "TOKENS|effectiveKeywordMap|keywordMap" packages/ide/src/pages/api/lexer.ts`
Expected: merge logic exists.

**Step 5: Commit**

```bash
git add packages/ide/src/pages/api/lexer.ts
git commit -m "feat(api): merge lexer keyword overrides with default reserveds"
```

### Task 4: Merge frontend keywordMap with backend defaults in /api/submissions/validate

**Files:**
- Modify: `packages/ide/src/pages/api/submissions/validate.ts`

**Step 1: Write failing test case (API behavior spec)

Expected behavior:
- Endpoint compiles with defaults when `keywordMap` missing.
- Endpoint supports overrides when `keywordMap` present.

**Step 2: Verify current implementation fails expectation**

Run: `rg -n "new Lexer\(|keywordMap|TOKENS" packages/ide/src/pages/api/submissions/validate.ts`
Expected: `new Lexer(sourceCode)` and no merge logic.

**Step 3: Write minimal implementation**

```ts
import { TOKENS } from "@ts-compilator-for-java/compiler/src/token/constants";
import type { KeywordMap } from "@ts-compilator-for-java/compiler/src/lexer";

const requestKeywordMap = req.body.keywordMap as KeywordMap | undefined;
const effectiveKeywordMap: KeywordMap = {
  ...(TOKENS.RESERVEDS as KeywordMap),
  ...(requestKeywordMap ?? {}),
};

const lexer = new Lexer(sourceCode, effectiveKeywordMap);
```

Keep existing error behavior unchanged.

**Step 4: Verify implementation is present**

Run: `rg -n "effectiveKeywordMap|keywordMap|new Lexer\(" packages/ide/src/pages/api/submissions/validate.ts`
Expected: merge logic and updated lexer constructor present.

**Step 5: Commit**

```bash
git add packages/ide/src/pages/api/submissions/validate.ts
git commit -m "feat(api): use merged keyword map in submission validation"
```

### Task 5: Add lightweight API regression tests for keyword map merge

**Files:**
- Create: `packages/ide/src/pages/api/__tests__/lexer-keyword-map.spec.ts` (or project-equivalent test location)
- Create: `packages/ide/src/pages/api/__tests__/submission-keyword-map.spec.ts`
- Modify: test config files only if necessary

**Step 1: Write failing tests**

```ts
it("uses default reserveds when request keywordMap is missing", async () => {
  // call handler with source using default switch/case/default
  // expect no lexical failure due to missing keywordMap
});

it("respects override map while preserving missing defaults", async () => {
  // send partial map overriding e.g. switch -> troca
  // expect parser/lexer recognizes override and still has defaults for non-overridden keys
});
```

**Step 2: Run tests to verify failure**

Run: `npm run test --workspace @ts-compilator-for-java/ide -- <test-paths>`
Expected: FAIL before handlers are adjusted.

**Step 3: Write minimal implementation adjustments**

If needed, refactor merge logic into tiny helper for easier testing:

```ts
export function buildEffectiveKeywordMap(overrides?: KeywordMap): KeywordMap {
  return {
    ...(TOKENS.RESERVEDS as KeywordMap),
    ...(overrides ?? {}),
  };
}
```

**Step 4: Run tests to verify pass**

Run: `npm run test --workspace @ts-compilator-for-java/ide -- <test-paths>`
Expected: PASS.

**Step 5: Commit**

```bash
git add packages/ide/src/pages/api
# plus any helper/test config touched
git commit -m "test(api): cover keyword map merge fallback and overrides"
```

### Task 6: End-to-end smoke verification in IDE flows

**Files:**
- No source changes required unless bug found.

**Step 1: Manual flow A (defaults only)**

- Open IDE with default mappings.
- Compile code using `switch/case/default`.
- Submit exercise.

Expected: both compile and submission validation succeed with same behavior.

**Step 2: Manual flow B (partial overrides)**

- Customize only one command (e.g., `switch -> troca`).
- Compile + submit code using override.

Expected: behavior consistent; non-overridden defaults still valid where appropriate.

**Step 3: Manual flow C (reset mappings)**

- Reset customizer to defaults.
- Re-run compile + submit.

Expected: defaults restored and accepted.

**Step 4: Run static checks/tests**

Run:
- `npm run lint --workspace @ts-compilator-for-java/ide` (if available)
- `npm run build --workspace @ts-compilator-for-java/ide`
- `npm run test --workspace @ts-compilator-for-java/ide` (if configured)

Expected: pass, or document known baseline failures unrelated to this feature.

**Step 5: Commit (if any fixes from smoke validation)**

```bash
git add packages/ide
git commit -m "chore(ide): finalize keyword map merge integration verification"
```

### Task 7: Documentation update

**Files:**
- Modify: `packages/ide/README.md` (or relevant docs section)

**Step 1: Write failing doc check (manual expectation)**

Expected docs mention:
- per-user keyword customization
- backend merge behavior (defaults + overrides)
- submission API now receives/uses `keywordMap`

**Step 2: Verify docs are missing details**

Run: `rg -n "keywordMap|custom keyword|switch|case|default|submission" packages/ide/README.md`
Expected: incomplete/missing details.

**Step 3: Write minimal docs update**

Add concise section explaining merge semantics and fallback behavior.

**Step 4: Re-verify docs content**

Run: `rg -n "keywordMap|fallback|override|switch|case|default" packages/ide/README.md`
Expected: matches found.

**Step 5: Commit**

```bash
git add packages/ide/README.md
git commit -m "docs(ide): document keyword override merge behavior"
```

### Task 8: Final verification before completion

**Files:**
- No new files required.

**Step 1: Run focused verification commands**

Run:
- `npm run build --workspace @ts-compilator-for-java/ide`
- `npm run test --workspace @ts-compilator-for-java/ide` (or targeted tests)

Expected: pass or known unrelated failures documented.

**Step 2: Verify changed files are in scope**

Run: `git status --short && git diff --name-only`
Expected: only intended IDE/API/doc files changed.

**Step 3: Summarize evidence**

Record command outputs and manual smoke outcomes in PR notes.

**Step 4: Integration commit (optional if not using per-task commits)**

```bash
git add packages/ide docs/plans
git commit -m "feat(ide): merge backend defaults with keyword overrides for switch and submission"
```

**Step 5: Prepare branch for review**

Run: `git log --oneline --decorate -n 10`
Expected: clean, understandable commit sequence.
