# Indent Dedent Token ID Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Give `indent` and `dedent` unique compiler token IDs so downstream consumers can classify indentation tokens correctly from `type` alone.

**Architecture:** Fix the ambiguity at the compiler source by renumbering `TOKENS.SYMBOLS.indent` and `TOKENS.SYMBOLS.dedent` to unique values, then update tests and consumers that depended on the old colliding numeric IDs. Keep lexer and parser behavior unchanged; only token identity changes.

**Tech Stack:** TypeScript, Vitest, compiler token constants, IDE token presentation code

---

### Task 1: Lock in unique indentation token IDs at the compiler constants layer

**Files:**
- Modify: `packages/compiler/src/token/constants/symbols.ts`
- Create: `packages/compiler/src/tests/tokens/indent-dedent-ids.spec.ts`

**Step 1: Write the failing token-constant test**

Create `packages/compiler/src/tests/tokens/indent-dedent-ids.spec.ts` with tests like:

```ts
import { describe, expect, it } from "vitest";
import { TOKENS } from "../../token/constants";

describe("indent/dedent token ids", () => {
  it("assigns unique ids to indent and dedent", () => {
    expect(TOKENS.SYMBOLS.indent).not.toBe(TOKENS.RESERVEDS.bool);
    expect(TOKENS.SYMBOLS.dedent).not.toBe(TOKENS.RESERVEDS.true);
  });

  it("resolves indent and dedent through BY_ID", () => {
    expect(TOKENS.BY_ID[TOKENS.SYMBOLS.indent]).toBe("indent");
    expect(TOKENS.BY_ID[TOKENS.SYMBOLS.dedent]).toBe("dedent");
  });
});
```

**Step 2: Run the test to verify it fails**

Run: `cd packages/compiler && npm test -- --run src/tests/tokens/indent-dedent-ids.spec.ts`
Expected: FAIL because `indent`/`dedent` currently collide with `bool`/`true`.

**Step 3: Write the minimal implementation**

Update `packages/compiler/src/token/constants/symbols.ts` so `indent` and `dedent` use unique IDs above the current reserved/symbol range.

Expected shape:

```ts
export const SYMBOLS = {
  semicolon: 36,
  comma: 37,
  left_brace: 38,
  right_brace: 39,
  left_paren: 40,
  right_paren: 41,
  dot: 42,
  left_bracket: 43,
  right_bracket: 44,
  colon: 53,
  newline: 54,
  indent: 58,
  dedent: 59,
};
```

Pick IDs that do not collide with any existing token constants.

**Step 4: Run the test to verify it passes**

Run: `cd packages/compiler && npm test -- --run src/tests/tokens/indent-dedent-ids.spec.ts`
Expected: PASS.

**Step 5: Commit**

```bash
git add packages/compiler/src/token/constants/symbols.ts packages/compiler/src/tests/tokens/indent-dedent-ids.spec.ts
git commit -m "fix(compiler): assign unique ids to indent and dedent"
```

### Task 2: Verify compiler lexer behavior still emits the renamed IDs correctly

**Files:**
- Modify: `packages/compiler/src/tests/lexer/indentation-tokens.spec.ts`
- Modify if needed: `packages/compiler/src/tests/lexer/indentation-errors.spec.ts`

**Step 1: Review existing lexer tests**

Inspect the current indentation lexer tests and confirm they assert against `TOKENS.SYMBOLS.indent` and `TOKENS.SYMBOLS.dedent`, not hardcoded numbers. If any hardcoded numeric IDs exist, replace them with constant-based assertions.

**Step 2: Add one explicit ID-sensitive assertion**

Extend `packages/compiler/src/tests/lexer/indentation-tokens.spec.ts` with an assertion like:

```ts
expect(tokens.some((token) => token.type === TOKENS.SYMBOLS.indent)).toBe(true);
expect(tokens.some((token) => token.type === TOKENS.SYMBOLS.dedent)).toBe(true);
```

Use constant-based checks only.

**Step 3: Run the focused lexer suite**

Run: `cd packages/compiler && npm test -- --run src/tests/lexer/indentation-errors.spec.ts src/tests/lexer/indentation-tokens.spec.ts`
Expected: PASS.

**Step 4: Commit**

```bash
git add packages/compiler/src/tests/lexer/indentation-tokens.spec.ts packages/compiler/src/tests/lexer/indentation-errors.spec.ts
git commit -m "test(compiler): verify indent and dedent token ids through lexer output"
```

### Task 3: Update IDE tests and consumers that depended on the old colliding IDs

**Files:**
- Modify: `packages/ide/src/utils/compiler/classification.spec.ts`
- Modify: `packages/ide/src/components/token-card.spec.tsx`
- Modify: any IDE test using raw `55` or `56` for indentation tokens

**Step 1: Write the failing consumer update**

Update IDE tests that currently assume indentation tokens use `55/56`.

Expected examples:

```ts
import { TOKENS } from "@ts-compilator-for-java/compiler/src/token/constants";

expect(classifier.classifyToken(TOKENS.SYMBOLS.indent, "<INDENT>").type).toBe("SYMBOLS");
```

and

```tsx
renderCard(TOKENS.SYMBOLS.indent, "<INDENT>");
renderCard(TOKENS.SYMBOLS.dedent, "<DEDENT>");
```

**Step 2: Run the focused IDE tests to verify the old assumptions fail if still present**

Run: `cd packages/ide && npx vitest run src/utils/compiler/classification.spec.ts src/components/token-card.spec.tsx`
Expected: FAIL until the raw old IDs are replaced or stale assumptions are removed.

**Step 3: Write the minimal implementation**

Replace hardcoded indentation token numbers in the affected IDE tests with compiler constants. If any runtime IDE code still contains collision workarounds that were only needed because of the old IDs, reduce them only if the behavior remains correct and the diff stays small.

**Step 4: Run the focused IDE tests**

Run: `cd packages/ide && npx vitest run src/utils/compiler/classification.spec.ts src/components/token-card.spec.tsx`
Expected: PASS.

**Step 5: Commit**

```bash
git add packages/ide/src/utils/compiler/classification.spec.ts packages/ide/src/components/token-card.spec.tsx
git commit -m "test(ide): align indent and dedent tests with compiler token ids"
```

### Task 4: Run compiler and IDE verification across the migration boundary

**Files:**
- Test: `packages/compiler/src/tests/tokens/indent-dedent-ids.spec.ts`
- Test: `packages/compiler/src/tests/lexer/indentation-errors.spec.ts`
- Test: `packages/compiler/src/tests/lexer/indentation-tokens.spec.ts`
- Test: `packages/compiler/src/tests/grammar/indentation-config.spec.ts`
- Test: `packages/ide/src/utils/compiler/classification.spec.ts`
- Test: `packages/ide/src/components/token-card.spec.tsx`

**Step 1: Run focused compiler verification**

Run: `cd packages/compiler && npm test -- --run src/tests/tokens/indent-dedent-ids.spec.ts src/tests/lexer/indentation-errors.spec.ts src/tests/lexer/indentation-tokens.spec.ts src/tests/grammar/indentation-config.spec.ts`
Expected: PASS.

**Step 2: Run focused IDE verification**

Run: `cd packages/ide && npx vitest run src/utils/compiler/classification.spec.ts src/components/token-card.spec.tsx`
Expected: PASS.

**Step 3: Run the broader compiler suite**

Run: `cd packages/compiler && npm test -- --run src/tests`
Expected: PASS.

**Step 4: Run the nearby IDE subset**

Run: `cd packages/ide && npx vitest run src/components/token-card.spec.tsx src/components/keyword-customizer.spec.tsx src/components/terminal/body.spec.tsx src/utils/compiler/classification.spec.ts`
Expected: PASS.

**Step 5: Inspect the diff**

Run: `git diff --stat`
Expected: compiler token constants, compiler tests, and IDE test alignment only. If runtime IDE code was reduced, it should be limited and justified.

**Step 6: Create the final implementation commit**

```bash
git add packages/compiler/src/token/constants/symbols.ts packages/compiler/src/tests/tokens/indent-dedent-ids.spec.ts packages/compiler/src/tests/lexer/indentation-errors.spec.ts packages/compiler/src/tests/lexer/indentation-tokens.spec.ts packages/compiler/src/tests/grammar/indentation-config.spec.ts packages/ide/src/utils/compiler/classification.spec.ts packages/ide/src/components/token-card.spec.tsx
git commit -m "fix: make indent and dedent token ids unique"
```
