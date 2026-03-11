# Monaco Dynamic Block Highlighting Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Add dynamic Monaco semantic highlighting for customized keyword categories and insert multi-line block scaffolds for customized block delimiters like `inicio`/`fim`.

**Architecture:** Keep Monaco Monarch tokenization as the source of syntax highlighting, but upgrade it to accept semantic keyword groups derived from the existing `original -> custom` keyword mapping. Add a Monaco editor provider layer in the IDE context that watches the active block delimiters and inserts a snippet scaffold when the opener is typed as a complete token in delimited block mode.

**Tech Stack:** TypeScript, React 19, Next.js, Monaco Editor, Vitest

---

### Task 1: Extract Editor Language Metadata Helpers

**Files:**
- Modify: `packages/ide/src/utils/compiler/editor/editor-language.ts`
- Test: `packages/ide/src/utils/compiler/editor/editor-language.spec.ts`

**Step 1: Write the failing test**

Create `packages/ide/src/utils/compiler/editor/editor-language.spec.ts` with unit tests that assert:

```ts
import { describe, expect, it } from "vitest";
import { buildJavaMMLanguageMetadata } from "@/utils/compiler/editor/editor-language";

describe("buildJavaMMLanguageMetadata", () => {
  it("maps customized words into semantic keyword groups", () => {
    const metadata = buildJavaMMLanguageMetadata([
      { original: "if", custom: "se", tokenId: 28 },
      { original: "while", custom: "enquanto", tokenId: 25 },
      { original: "int", custom: "inteiro", tokenId: 21 },
      { original: "print", custom: "escreva", tokenId: 33 },
    ]);

    expect(metadata.allKeywords).toEqual(
      expect.arrayContaining(["se", "enquanto", "inteiro", "escreva"]),
    );
    expect(metadata.semanticGroups.conditionals).toContain("se");
    expect(metadata.semanticGroups.loops).toContain("enquanto");
    expect(metadata.semanticGroups.types).toContain("inteiro");
    expect(metadata.semanticGroups.io).toContain("escreva");
  });
});
```

**Step 2: Run test to verify it fails**

Run: `npx vitest run packages/ide/src/utils/compiler/editor/editor-language.spec.ts`

Expected: FAIL because `buildJavaMMLanguageMetadata` does not exist yet.

**Step 3: Write minimal implementation**

In `packages/ide/src/utils/compiler/editor/editor-language.ts`:
- Introduce a typed metadata builder that accepts keyword mappings, not only a flat string array.
- Export a helper like `buildJavaMMLanguageMetadata`.
- Define stable semantic groups:
  - `types`
  - `conditionals`
  - `loops`
  - `flow`
  - `io`
- Keep a flat `allKeywords` array for tokenizer recognition.
- Preserve backward compatibility only if it stays simple; otherwise update callers in the next task.

**Step 4: Run test to verify it passes**

Run: `npx vitest run packages/ide/src/utils/compiler/editor/editor-language.spec.ts`

Expected: PASS

**Step 5: Commit**

```bash
git add packages/ide/src/utils/compiler/editor/editor-language.ts packages/ide/src/utils/compiler/editor/editor-language.spec.ts
git commit -m "refactor: extract monaco language metadata helpers"
```

### Task 2: Add Semantic Monaco Token Classes

**Files:**
- Modify: `packages/ide/src/utils/compiler/editor/editor-language.ts`
- Modify: `packages/ide/src/contexts/EditorContext.tsx`
- Test: `packages/ide/src/utils/compiler/editor/editor-language.spec.ts`

**Step 1: Write the failing test**

Extend `packages/ide/src/utils/compiler/editor/editor-language.spec.ts` with assertions that the Monarch tokenizer cases route customized words into semantic token classes.

Example shape:

```ts
it("assigns semantic Monaco token classes", () => {
  const metadata = buildJavaMMLanguageMetadata([
    { original: "if", custom: "se", tokenId: 28 },
    { original: "while", custom: "enquanto", tokenId: 25 },
    { original: "int", custom: "inteiro", tokenId: 21 },
  ]);

  const language = buildJavaMMMonarchLanguage(metadata);

  expect(language.tokenizer.root[0][1].cases["@conditionals"]).toBe(
    "keyword.conditional",
  );
  expect(language.tokenizer.root[0][1].cases["@loops"]).toBe("keyword.loop");
  expect(language.tokenizer.root[0][1].cases["@types"]).toBe("keyword.type");
});
```

**Step 2: Run test to verify it fails**

Run: `npx vitest run packages/ide/src/utils/compiler/editor/editor-language.spec.ts`

Expected: FAIL because the tokenizer builder does not expose semantic cases yet.

**Step 3: Write minimal implementation**

In `packages/ide/src/utils/compiler/editor/editor-language.ts`:
- Extract a `buildJavaMMMonarchLanguage(metadata)` helper for direct testing.
- Feed semantic groups into Monarch top-level arrays such as `types`, `conditionals`, `loops`, `flow`, and `io`.
- Update the identifier token case table to emit:
  - `keyword.type`
  - `keyword.conditional`
  - `keyword.loop`
  - `keyword.flow`
  - `keyword.io`
  - fallback `keyword`

In `packages/ide/src/contexts/EditorContext.tsx`:
- Add Monaco theme rules for the new token classes in both `editor-glass-dark` and `editor-glass-light`.
- Keep the visual palette aligned with the existing themes instead of introducing unrelated colors.

**Step 4: Run test to verify it passes**

Run: `npx vitest run packages/ide/src/utils/compiler/editor/editor-language.spec.ts`

Expected: PASS

**Step 5: Commit**

```bash
git add packages/ide/src/utils/compiler/editor/editor-language.ts packages/ide/src/utils/compiler/editor/editor-language.spec.ts packages/ide/src/contexts/EditorContext.tsx
git commit -m "feat: add semantic monaco keyword highlighting"
```

### Task 3: Wire Dynamic Keyword Mappings Into Monaco Registration

**Files:**
- Modify: `packages/ide/src/contexts/KeywordContext.tsx`
- Modify: `packages/ide/src/contexts/EditorContext.tsx`
- Modify: `packages/ide/src/utils/compiler/editor/editor-language.ts`
- Test: `packages/ide/src/utils/compiler/editor/editor-language.spec.ts`

**Step 1: Write the failing test**

Add a unit test that covers the real mapping shape produced by `KeywordContext`, including categories that are not loops or conditionals:

```ts
it("preserves semantic meaning after keyword customization", () => {
  const metadata = buildJavaMMLanguageMetadata([
    { original: "return", custom: "retorne", tokenId: 30 },
    { original: "scan", custom: "leia", tokenId: 35 },
    { original: "switch", custom: "escolha", tokenId: 50 },
  ]);

  expect(metadata.semanticGroups.flow).toContain("retorne");
  expect(metadata.semanticGroups.io).toContain("leia");
  expect(metadata.semanticGroups.conditionals).toContain("escolha");
});
```

**Step 2: Run test to verify it fails**

Run: `npx vitest run packages/ide/src/utils/compiler/editor/editor-language.spec.ts`

Expected: FAIL if any semantic mapping is still incomplete or hard-coded incorrectly.

**Step 3: Write minimal implementation**

Update the integration boundary so Monaco registration consumes the full keyword mapping state:
- Export a reusable derivation helper from `KeywordContext.tsx` or a nearby editor utility instead of re-encoding semantic groups in multiple places.
- Replace the current `customWords` string-array flow with a structured mapping flow.
- Keep `retokenize()` as the re-tokenization trigger after Monaco provider updates.

Keep the code DRY:
- one source of truth for semantic group derivation
- one source of truth for Monaco tokenizer construction

**Step 4: Run test to verify it passes**

Run: `npx vitest run packages/ide/src/utils/compiler/editor/editor-language.spec.ts`

Expected: PASS

**Step 5: Commit**

```bash
git add packages/ide/src/contexts/KeywordContext.tsx packages/ide/src/contexts/EditorContext.tsx packages/ide/src/utils/compiler/editor/editor-language.ts packages/ide/src/utils/compiler/editor/editor-language.spec.ts
git commit -m "refactor: wire dynamic keyword semantics into monaco"
```

### Task 4: Add Block Scaffold Provider Helpers

**Files:**
- Modify: `packages/ide/src/utils/compiler/editor/editor-language.ts`
- Test: `packages/ide/src/utils/compiler/editor/editor-language.spec.ts`

**Step 1: Write the failing test**

Add unit tests for pure helper functions that decide whether scaffolding should run and what text to insert.

Example:

```ts
import { buildBlockScaffoldSnippet, shouldEnableBlockScaffold } from "@/utils/compiler/editor/editor-language";

it("builds a three-line scaffold snippet", () => {
  expect(buildBlockScaffoldSnippet("inicio", "fim")).toContain("inicio");
  expect(buildBlockScaffoldSnippet("inicio", "fim")).toContain("fim");
});

it("enables scaffolding only for valid delimited blocks", () => {
  expect(
    shouldEnableBlockScaffold({
      blockMode: "delimited",
      blockDelimiters: { open: "inicio", close: "fim" },
    }),
  ).toBe(true);
});
```

**Step 2: Run test to verify it fails**

Run: `npx vitest run packages/ide/src/utils/compiler/editor/editor-language.spec.ts`

Expected: FAIL because scaffold helpers do not exist yet.

**Step 3: Write minimal implementation**

In `packages/ide/src/utils/compiler/editor/editor-language.ts`:
- Add a helper that validates whether block scaffolding should be active.
- Add a helper that returns the Monaco snippet body for:

```txt
inicio
  $0
fim
```

- Keep indentation simple and deterministic.

**Step 4: Run test to verify it passes**

Run: `npx vitest run packages/ide/src/utils/compiler/editor/editor-language.spec.ts`

Expected: PASS

**Step 5: Commit**

```bash
git add packages/ide/src/utils/compiler/editor/editor-language.ts packages/ide/src/utils/compiler/editor/editor-language.spec.ts
git commit -m "feat: add monaco block scaffold helpers"
```

### Task 5: Register And Refresh Monaco Block Scaffold Provider

**Files:**
- Modify: `packages/ide/src/contexts/EditorContext.tsx`
- Modify: `packages/ide/src/contexts/KeywordContext.tsx`
- Test: `packages/ide/src/utils/compiler/editor/editor-language.spec.ts`
- Test: `packages/ide/src/contexts/EditorContext.block-scaffold.spec.ts`

**Step 1: Write the failing test**

Create `packages/ide/src/contexts/EditorContext.block-scaffold.spec.ts` with a focused integration test around provider registration/disposal.

Test targets:
- provider registers when block mode is `delimited` and delimiters are valid
- provider is disposed and replaced when delimiters change
- provider is disabled in indentation mode

Use a small Monaco stub object instead of the real editor runtime. Assert calls to:
- `monaco.languages.registerCompletionItemProvider(...)`
- provider `dispose()`

**Step 2: Run test to verify it fails**

Run: `npx vitest run packages/ide/src/contexts/EditorContext.block-scaffold.spec.ts`

Expected: FAIL because the provider management logic does not exist yet.

**Step 3: Write minimal implementation**

In `packages/ide/src/contexts/EditorContext.tsx`:
- Track the active block scaffold provider in a ref.
- Register a Monaco completion provider or typed-text provider after Monaco initializes.
- Re-register it whenever the active block delimiters or block mode change.
- Dispose the old provider before registering a new one.
- Use Monaco context checks so scaffolds do not trigger inside comments or strings when token data indicates that context.

In `packages/ide/src/contexts/KeywordContext.tsx`:
- Expose the minimum editor-facing data needed for provider refresh, without duplicating validation rules.

**Step 4: Run test to verify it passes**

Run: `npx vitest run packages/ide/src/contexts/EditorContext.block-scaffold.spec.ts`

Expected: PASS

**Step 5: Commit**

```bash
git add packages/ide/src/contexts/EditorContext.tsx packages/ide/src/contexts/KeywordContext.tsx packages/ide/src/contexts/EditorContext.block-scaffold.spec.ts packages/ide/src/utils/compiler/editor/editor-language.spec.ts
git commit -m "feat: register dynamic monaco block scaffold provider"
```

### Task 6: Verify End-To-End Editor Behavior

**Files:**
- Modify: `packages/ide/src/contexts/EditorContext.tsx` if needed
- Modify: `packages/ide/src/utils/compiler/editor/editor-language.ts` if needed
- Test: `packages/ide/src/utils/compiler/editor/editor-language.spec.ts`
- Test: `packages/ide/src/contexts/EditorContext.block-scaffold.spec.ts`

**Step 1: Write the failing test**

Add final assertions for edge cases:
- comments do not trigger block scaffolds
- strings do not trigger block scaffolds
- the inserted closer always matches the latest customized closer

Keep these in the existing spec files rather than creating another test file.

**Step 2: Run test to verify it fails**

Run: `npx vitest run packages/ide/src/utils/compiler/editor/editor-language.spec.ts packages/ide/src/contexts/EditorContext.block-scaffold.spec.ts`

Expected: FAIL until the context guards and latest-config behavior are correct.

**Step 3: Write minimal implementation**

Tighten the provider logic so it:
- checks token/context safety before inserting
- uses the latest customization state after every refresh
- leaves editor behavior unchanged in unsupported contexts

**Step 4: Run test to verify it passes**

Run: `npx vitest run packages/ide/src/utils/compiler/editor/editor-language.spec.ts packages/ide/src/contexts/EditorContext.block-scaffold.spec.ts`

Expected: PASS

**Step 5: Commit**

```bash
git add packages/ide/src/contexts/EditorContext.tsx packages/ide/src/utils/compiler/editor/editor-language.ts packages/ide/src/utils/compiler/editor/editor-language.spec.ts packages/ide/src/contexts/EditorContext.block-scaffold.spec.ts
git commit -m "test: cover monaco scaffold edge cases"
```

### Task 7: Run Project Verification

**Files:**
- Modify: none unless verification reveals issues

**Step 1: Run targeted tests**

Run:

```bash
npx vitest run packages/ide/src/utils/compiler/editor/editor-language.spec.ts packages/ide/src/contexts/EditorContext.block-scaffold.spec.ts packages/ide/src/lib/compiler-config.spec.ts
```

Expected: PASS

**Step 2: Run broader IDE checks**

Run:

```bash
npm --workspace packages/ide run lint
```

Expected: PASS

**Step 3: Run full relevant test sweep if the repo supports it cleanly**

Run:

```bash
npx vitest run packages/ide/src/pages/api/__tests__/submission-config.spec.ts packages/ide/src/pages/api/__tests__/intermediator-config.spec.ts packages/ide/src/components/terminal/body.spec.tsx
```

Expected: PASS

**Step 4: Commit verification fixes if needed**

If any verification change is required:

```bash
git add <relevant files>
git commit -m "fix: address monaco verification issues"
```

**Step 5: Prepare review**

Run:

```bash
git status --short
git log --oneline -5
```

Expected: clean working tree except for intentional uncommitted work, and a readable commit sequence for review.
