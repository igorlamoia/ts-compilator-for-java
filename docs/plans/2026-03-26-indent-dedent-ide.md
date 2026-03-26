# Indent Dedent IDE Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Fix the IDE so `<INDENT>` and `<DEDENT>` are classified as symbol tokens and rendered with translated labels instead of colliding with reserved-word IDs.

**Architecture:** Keep the fix in the IDE layer only. Add explicit indentation-token overrides in the classifier and in the token-label resolution path so the UI stops depending on ambiguous numeric token lookup for these two structural lexemes.

**Tech Stack:** TypeScript, React, Next.js, Vitest, existing IDE/compiler shared token constants

---

### Task 1: Lock in the IDE classification override behavior

**Files:**
- Create: `packages/ide/src/utils/compiler/classification.spec.ts`
- Modify: `packages/ide/src/utils/compiler/classification.ts`

**Step 1: Write the failing classifier tests**

Create `packages/ide/src/utils/compiler/classification.spec.ts` with tests like:

```ts
import { describe, expect, it } from "vitest";
import { Classification } from "./classification";

describe("Classification", () => {
  it("classifies <INDENT> as SYMBOLS even when the numeric id collides", () => {
    const classification = new Classification();

    expect(
      classification.classifyToken(55, "<INDENT>").type,
    ).toBe("SYMBOLS");
  });

  it("classifies <DEDENT> as SYMBOLS even when the numeric id collides", () => {
    const classification = new Classification();

    expect(
      classification.classifyToken(56, "<DEDENT>").type,
    ).toBe("SYMBOLS");
  });
});
```

**Step 2: Run the test to verify it fails**

Run: `cd packages/ide && npm test -- --run src/utils/compiler/classification.spec.ts`
Expected: FAIL because `classifyToken` currently uses only the numeric ID and will resolve the collision incorrectly.

**Step 3: Write the minimal implementation**

Update `packages/ide/src/utils/compiler/classification.ts` so `classifyToken` and `findTokenClassification` accept the token lexeme and short-circuit indentation structural lexemes before numeric-family lookup:

```ts
classifyToken(tokenType: number, lexeme?: string) {
  const TYPE = this.findTokenClassification(tokenType, lexeme);
  return {
    type: TYPE ?? "NOT_FOUND",
    styles: this.findTokenStyle(TYPE),
  };
}

findTokenClassification(tokenType: number, lexeme?: string) {
  if (lexeme === "<INDENT>" || lexeme === "<DEDENT>") {
    return "SYMBOLS";
  }
  // existing numeric lookup
}
```

**Step 4: Update classifier callers**

Update callers that already have token objects, especially `packages/ide/src/utils/compiler/editor/tokens.ts`, to pass both `token.type` and `token.lexeme`.

Expected shape:

```ts
const { type = "NOT_FOUND", styles } =
  TokenClassification.classifyToken(token.type, token.lexeme) ?? {};
```

**Step 5: Run the tests to verify they pass**

Run: `cd packages/ide && npm test -- --run src/utils/compiler/classification.spec.ts`
Expected: PASS.

**Step 6: Commit**

```bash
git add packages/ide/src/utils/compiler/classification.ts packages/ide/src/utils/compiler/editor/tokens.ts packages/ide/src/utils/compiler/classification.spec.ts
git commit -m "fix(ide): classify indent and dedent as symbols"
```

### Task 2: Lock in translated labels for indentation tokens

**Files:**
- Create: `packages/ide/src/components/token-card.spec.tsx`
- Modify: `packages/ide/src/components/token-card.tsx`

**Step 1: Write the failing token-card tests**

Create `packages/ide/src/components/token-card.spec.tsx` with a focused rendering test for indentation tokens.

Minimum cases:

```tsx
it("renders translated label for <INDENT>", () => {
  // render TokenCard with token { type: 55, lexeme: "<INDENT>", ... }
  // mock router locale as "pt-BR"
  // expect visible label "indentação"
});

it("renders translated label for <DEDENT>", () => {
  // render TokenCard with token { type: 56, lexeme: "<DEDENT>", ... }
  // mock router locale as "pt-BR"
  // expect visible label "desindentação"
});
```

Do not rely on `TOKENS.BY_ID[token.type]` in the expectation because that is the current bug.

**Step 2: Run the test to verify it fails**

Run: `cd packages/ide && npm test -- --run src/components/token-card.spec.tsx`
Expected: FAIL because `TokenCard` currently derives the token name from `TOKENS.BY_ID[token.type]`.

**Step 3: Write the minimal implementation**

Update `packages/ide/src/components/token-card.tsx` to resolve indentation token keys explicitly:

```ts
function resolveTokenName(token: TToken): string | null {
  if (token.lexeme === "<INDENT>") return "indent";
  if (token.lexeme === "<DEDENT>") return "dedent";
  return TOKENS.BY_ID[token.type] ?? null;
}
```

Then use that resolver before calling `translateTokenDescription`.

**Step 4: Run the tests to verify they pass**

Run: `cd packages/ide && npm test -- --run src/components/token-card.spec.tsx`
Expected: PASS.

**Step 5: Commit**

```bash
git add packages/ide/src/components/token-card.tsx packages/ide/src/components/token-card.spec.tsx
git commit -m "fix(ide): translate indent and dedent labels"
```

### Task 3: Verify token grouping and rendering paths together

**Files:**
- Modify: `packages/ide/src/views/tokens/show-tokens.tsx`
- Test: `packages/ide/src/utils/compiler/classification.spec.ts`
- Test: `packages/ide/src/components/token-card.spec.tsx`

**Step 1: Review the grouped-token path**

Inspect `packages/ide/src/views/tokens/show-tokens.tsx` and confirm all classification calls now pass `token.lexeme` through the updated path. If the fix in `classifyTokens` already covers all grouped rendering, keep this file unchanged.

**Step 2: Add one integration-shaped assertion only if needed**

If grouped rendering still bypasses the corrected classifier path, add the minimal change so token grouping and card rendering both receive the fixed classification.

**Step 3: Run the focused IDE tests**

Run: `cd packages/ide && npm test -- --run src/utils/compiler/classification.spec.ts src/components/token-card.spec.tsx`
Expected: PASS.

**Step 4: Commit**

```bash
git add packages/ide/src/views/tokens/show-tokens.tsx packages/ide/src/utils/compiler/classification.spec.ts packages/ide/src/components/token-card.spec.tsx
git commit -m "test(ide): verify indent dedent token presentation"
```

### Task 4: Run final IDE verification

**Files:**
- Test: `packages/ide/src/utils/compiler/classification.spec.ts`
- Test: `packages/ide/src/components/token-card.spec.tsx`

**Step 1: Run the focused tests**

Run: `cd packages/ide && npm test -- --run src/utils/compiler/classification.spec.ts src/components/token-card.spec.tsx`
Expected: PASS.

**Step 2: Run the broader relevant IDE suite**

Run: `cd packages/ide && npm test -- --run src/utils/compiler src/components`
Expected: PASS, or if the repo does not expose tests for those paths, run the closest supported subset and record the gap.

**Step 3: Inspect the diff**

Run: `git diff --stat`
Expected: IDE classifier, token card, and related tests only.

**Step 4: Create the final implementation commit**

```bash
git add packages/ide/src/utils/compiler/classification.ts packages/ide/src/utils/compiler/editor/tokens.ts packages/ide/src/utils/compiler/classification.spec.ts packages/ide/src/components/token-card.tsx packages/ide/src/components/token-card.spec.tsx packages/ide/src/views/tokens/show-tokens.tsx
git commit -m "fix(ide): render indent and dedent tokens correctly"
```
