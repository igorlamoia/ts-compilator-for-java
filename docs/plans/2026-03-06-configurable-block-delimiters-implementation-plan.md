# Configurable Block Delimiters Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Add configurable word-based block delimiters loaded from lexer config while preserving `{` and `}` as default and always-supported delimiters.

**Architecture:** Extend lexer configuration to accept `blockDelimiters` aliases that map word lexemes to existing `left_brace/right_brace` token ids. Keep parser logic unchanged by preserving token-level contracts (`TOKENS.SYMBOLS.left_brace/right_brace`). Validate delimiter config at lexer construction time to fail fast on invalid or conflicting settings.

**Tech Stack:** TypeScript, Vitest, existing lexer/parser/token pipeline in `packages/compiler`.

---

### Task 1: Add Lexer Config Type And Validation

**Files:**
- Modify: `packages/compiler/src/lexer/index.ts`
- Create: `packages/compiler/src/lexer/config.ts`
- Test: `packages/compiler/src/tests/lexer/block-delimiters.spec.ts`

**Step 1: Write the failing test**

```ts
import { describe, expect, it } from "vitest";
import { Lexer } from "../../lexer";
import { TOKENS } from "../../token/constants";

describe("Lexer Block Delimiters", () => {
  it("should map configured open/close words to brace token ids", () => {
    const source = `int main() begin print("ok"); end`;
    const lexer = new Lexer(source, {
      blockDelimiters: { open: "begin", close: "end" },
    });

    const types = lexer.scanTokens().map((t) => t.type);

    expect(types).toContain(TOKENS.SYMBOLS.left_brace);
    expect(types).toContain(TOKENS.SYMBOLS.right_brace);
  });
});
```

**Step 2: Run test to verify it fails**

Run: `cd packages/compiler && npm run test -- src/tests/lexer/block-delimiters.spec.ts`
Expected: FAIL because `Lexer` does not accept config object yet.

**Step 3: Write minimal implementation**

```ts
// packages/compiler/src/lexer/config.ts
export type KeywordMap = Record<string, number>;

export type LexerBlockDelimiters = {
  open: string;
  close: string;
};

export type LexerConfig = {
  customKeywords?: KeywordMap;
  blockDelimiters?: LexerBlockDelimiters;
  locale?: string;
};
```

```ts
// packages/compiler/src/lexer/index.ts (constructor sketch)
constructor(source: string, config?: LexerConfig) {
  this.source = source;
  this.locale = config?.locale;
  this.keywordMap = {
    ...(TOKENS.RESERVEDS as KeywordMap),
    ...(config?.customKeywords ?? {}),
  };

  const delimiters = config?.blockDelimiters;
  if (delimiters) {
    validateBlockDelimiters(delimiters, TOKENS.RESERVEDS as KeywordMap);
    this.keywordMap[delimiters.open] = TOKENS.SYMBOLS.left_brace;
    this.keywordMap[delimiters.close] = TOKENS.SYMBOLS.right_brace;
  }
}
```

**Step 4: Run test to verify it passes**

Run: `cd packages/compiler && npm run test -- src/tests/lexer/block-delimiters.spec.ts`
Expected: PASS.

**Step 5: Commit**

```bash
git add packages/compiler/src/lexer/index.ts \
        packages/compiler/src/lexer/config.ts \
        packages/compiler/src/tests/lexer/block-delimiters.spec.ts
git commit -m "feat(lexer): add configurable block delimiters"
```

### Task 2: Add Validation Coverage For Delimiter Config

**Files:**
- Modify: `packages/compiler/src/lexer/config.ts`
- Test: `packages/compiler/src/tests/lexer/block-delimiters.spec.ts`

**Step 1: Write failing tests for invalid configurations**

```ts
it("should reject equal open and close delimiters", () => {
  expect(
    () =>
      new Lexer("int main() {}", {
        blockDelimiters: { open: "begin", close: "begin" },
      })
  ).toThrow();
});

it("should reject non-word delimiters", () => {
  expect(
    () =>
      new Lexer("int main() {}", {
        blockDelimiters: { open: "<<", close: "end" },
      })
  ).toThrow();
});

it("should reject conflicts with reserved words", () => {
  expect(
    () =>
      new Lexer("int main() {}", {
        blockDelimiters: { open: "if", close: "end" },
      })
  ).toThrow();
});
```

**Step 2: Run tests to verify failures**

Run: `cd packages/compiler && npm run test -- src/tests/lexer/block-delimiters.spec.ts`
Expected: FAIL with missing validation logic.

**Step 3: Write minimal validation implementation**

```ts
const WORD_REGEX = /^[A-Za-z_][A-Za-z0-9_]*$/;

export function validateBlockDelimiters(
  delimiters: LexerBlockDelimiters,
  reserved: KeywordMap,
): void {
  const { open, close } = delimiters;

  if (!WORD_REGEX.test(open) || !WORD_REGEX.test(close)) {
    throw new Error("block delimiters must be identifier-like words");
  }

  if (open === close) {
    throw new Error("block delimiters must be different");
  }

  if (reserved[open] || reserved[close]) {
    throw new Error("block delimiters cannot reuse reserved keywords");
  }
}
```

**Step 4: Run tests to verify pass**

Run: `cd packages/compiler && npm run test -- src/tests/lexer/block-delimiters.spec.ts`
Expected: PASS.

**Step 5: Commit**

```bash
git add packages/compiler/src/lexer/config.ts \
        packages/compiler/src/tests/lexer/block-delimiters.spec.ts
git commit -m "test(lexer): validate block delimiter configuration"
```

### Task 3: Update Call Sites To New Lexer Config Shape

**Files:**
- Modify: `packages/compiler/src/tests/grammar/helpers.ts`
- Modify: `packages/compiler/src/index.ts`
- Modify: `packages/compiler/src/index-intermediate.ts`
- Test: `packages/compiler/src/tests/grammar/block-delimiters.spec.ts`

**Step 1: Write failing grammar integration test using configured delimiters**

```ts
import { describe, expect, it } from "vitest";
import { Lexer } from "../../lexer";
import { TokenIterator } from "../../token/TokenIterator";
import { functionCall } from "../../grammar/syntax/function-call";

it("should parse blocks using configured begin/end delimiters", () => {
  const source = `
    int main() begin
      int x = 1;
      if (x == 1) begin
        print("ok");
      end
    end
  `;

  const lexer = new Lexer(source, {
    locale: "en",
    blockDelimiters: { open: "begin", close: "end" },
  });

  const iterator = new TokenIterator(lexer.scanTokens(), "en");
  while (iterator.hasNext()) functionCall(iterator);

  expect(iterator.emitter.getInstructions().length).toBeGreaterThan(0);
});
```

**Step 2: Run test to verify it fails**

Run: `cd packages/compiler && npm run test -- src/tests/grammar/block-delimiters.spec.ts`
Expected: FAIL if any call-site or lexer-config wiring is incomplete.

**Step 3: Implement minimal call-site updates**

```ts
// helpers.ts
const lexer = new Lexer(source, { locale: "en" });
```

```ts
// index.ts / index-intermediate.ts
const lexer = new Lexer(sourceCode, { locale: "en" });
```

**Step 4: Run test to verify it passes**

Run: `cd packages/compiler && npm run test -- src/tests/grammar/block-delimiters.spec.ts`
Expected: PASS.

**Step 5: Commit**

```bash
git add packages/compiler/src/tests/grammar/helpers.ts \
        packages/compiler/src/tests/grammar/block-delimiters.spec.ts \
        packages/compiler/src/index.ts \
        packages/compiler/src/index-intermediate.ts
git commit -m "test(grammar): support configured block delimiters in parsing"
```

### Task 4: Regression And Mixed-Delimiter Coverage

**Files:**
- Modify: `packages/compiler/src/tests/grammar/block-delimiters.spec.ts`
- Modify: `packages/compiler/src/tests/lexer/block-delimiters.spec.ts`

**Step 1: Add failing mixed-style regression tests**

```ts
it("should allow braces and configured words in the same source", () => {
  const source = `
    int main() begin
      if (1 == 1) { print("a"); }
    end
  `;

  const lexer = new Lexer(source, {
    blockDelimiters: { open: "begin", close: "end" },
    locale: "en",
  });

  const iterator = new TokenIterator(lexer.scanTokens(), "en");
  while (iterator.hasNext()) functionCall(iterator);

  expect(iterator.emitter.getInstructions().length).toBeGreaterThan(0);
});
```

**Step 2: Run targeted tests to verify failures**

Run: `cd packages/compiler && npm run test -- src/tests/lexer/block-delimiters.spec.ts src/tests/grammar/block-delimiters.spec.ts`
Expected: FAIL if mixed support is broken.

**Step 3: Implement minimal fixes (if needed)**

Keep symbol token map entries for `{` and `}` unchanged and ensure keyword aliases only add alternate lexemes.

**Step 4: Run targeted tests to verify pass**

Run: `cd packages/compiler && npm run test -- src/tests/lexer/block-delimiters.spec.ts src/tests/grammar/block-delimiters.spec.ts`
Expected: PASS.

**Step 5: Commit**

```bash
git add packages/compiler/src/tests/lexer/block-delimiters.spec.ts \
        packages/compiler/src/tests/grammar/block-delimiters.spec.ts
git commit -m "test: add mixed block delimiter compatibility coverage"
```

### Task 5: Update Grammar Documentation

**Files:**
- Modify: `packages/compiler/src/grammar/ast/README.md`

**Step 1: Write failing doc expectation (manual check)**

Open README and confirm it still documents literal-only braces.

**Step 2: Run manual check**

Run: `sed -n '1,220p' packages/compiler/src/grammar/ast/README.md`
Expected: still brace-only notation.

**Step 3: Update documentation minimally**

Add a short note near `<bloco>` and `switch` productions:
- Grammar consumes `left_brace/right_brace` block tokens.
- Tokens may come from literal braces or configured word delimiters in lexer config.

**Step 4: Verify doc output**

Run: `sed -n '1,240p' packages/compiler/src/grammar/ast/README.md`
Expected: updated note is present and wording is clear.

**Step 5: Commit**

```bash
git add packages/compiler/src/grammar/ast/README.md
git commit -m "docs(grammar): document configurable block delimiter tokens"
```

### Task 6: Final Verification Before Completion

**Files:**
- Verify full package test suite in `packages/compiler`

**Step 1: Run lexer + grammar targeted suite**

Run: `cd packages/compiler && npm run test -- src/tests/lexer src/tests/grammar`
Expected: PASS.

**Step 2: Run full compiler tests**

Run: `cd packages/compiler && npm run test`
Expected: PASS.

**Step 3: Review changed files for scope**

Run: `git status --short`
Expected: only intended implementation + tests + docs files changed.

**Step 4: Final integration commit (if needed)**

```bash
git add -A
git commit -m "feat(grammar): support configurable word block delimiters"
```

**Step 5: Capture completion evidence**

Record test command outputs in PR/summary notes to show successful verification.
