# Strict Indentation Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Enforce Python-like exact indentation in indentation block mode by inferring one file-wide indentation unit from the first valid block indent and rejecting sibling misalignment or multi-level indentation jumps.

**Architecture:** Keep indentation policy entirely in the lexer so the parser continues consuming `NEWLINE`, `INDENT`, and `DEDENT` tokens without knowing indentation widths. Extend the lexer with an inferred `indentUnit`, tighten newline-depth transitions, and cover the new behavior with focused lexer tests plus one parser regression test.

**Tech Stack:** TypeScript, Vitest, existing compiler lexer/parser pipeline

---

### Task 1: Lock the desired behavior with failing lexer tests

**Files:**
- Modify: `packages/compiler/src/tests/lexer/indentation-errors.spec.ts`
- Modify: `packages/compiler/src/tests/lexer/indentation-tokens.spec.ts`

**Step 1: Write the failing test for inferred indentation unit reuse**

Add this test to `packages/compiler/src/tests/lexer/indentation-errors.spec.ts`:

```ts
it("rejects a later block that uses a different indent unit", () => {
  const src = [
    "int main():",
    "  if (1 == 1):",
    "    print(1);",
    "      if (2 == 2):",
    "        print(2);",
  ].join("\n");

  expect(() =>
    new Lexer(src, {
      indentationBlock: true,
    }).scanTokens(),
  ).toThrow();
});
```

**Step 2: Run test to verify it fails**

Run: `npm test -- --run packages/compiler/src/tests/lexer/indentation-errors.spec.ts`
Expected: FAIL because the lexer currently accepts arbitrary deeper indentation increases.

**Step 3: Write the failing test for multi-level indentation jumps**

Add this test to `packages/compiler/src/tests/lexer/indentation-errors.spec.ts`:

```ts
it("rejects entering a child block more than one logical level deeper", () => {
  const src = [
    "int main():",
    "    print(1);",
  ].join("\n");

  expect(() =>
    new Lexer(src, {
      indentationBlock: true,
      tabWidth: 2,
    }).scanTokens(),
  ).toThrow();
});
```

**Step 4: Run test to verify it fails**

Run: `npm test -- --run packages/compiler/src/tests/lexer/indentation-errors.spec.ts`
Expected: FAIL because the lexer currently accepts any positive indentation increase after `:`.

**Step 5: Write the failing test for exact sibling depth**

Add this test to `packages/compiler/src/tests/lexer/indentation-errors.spec.ts`:

```ts
it("rejects sibling lines that do not align to the same block depth", () => {
  const src = [
    "int main():",
    "  print(1);",
    "   print(2);",
  ].join("\n");

  expect(() =>
    new Lexer(src, {
      indentationBlock: true,
    }).scanTokens(),
  ).toThrow();
});
```

**Step 6: Run test to verify it fails**

Run: `npm test -- --run packages/compiler/src/tests/lexer/indentation-errors.spec.ts`
Expected: FAIL because the lexer currently treats the third line as a deeper indentation increase instead of a structural error.

**Step 7: Write the success test for inferred-unit nesting**

Add this test to `packages/compiler/src/tests/lexer/indentation-tokens.spec.ts`:

```ts
it("accepts sibling alignment and nested blocks that reuse the inferred unit", () => {
  const src = [
    "int main():",
    "  print(1);",
    "  if (1 == 1):",
    "    print(2);",
    "  print(3);",
  ].join("\n");

  expect(() =>
    new Lexer(src, {
      indentationBlock: true,
    }).scanTokens(),
  ).not.toThrow();
});
```

**Step 8: Run test to verify it passes before implementation only if behavior already matches**

Run: `npm test -- --run packages/compiler/src/tests/lexer/indentation-tokens.spec.ts`
Expected: PASS for the new success case or no regression in existing token emission behavior.

**Step 9: Commit**

```bash
git add packages/compiler/src/tests/lexer/indentation-errors.spec.ts packages/compiler/src/tests/lexer/indentation-tokens.spec.ts
git commit -m "test: cover strict indentation rules"
```

### Task 2: Implement inferred strict indentation in the lexer

**Files:**
- Modify: `packages/compiler/src/lexer/index.ts`

**Step 1: Add the failing implementation checkpoint**

Open `packages/compiler/src/lexer/index.ts` and identify these edit points:

- class fields near `indentStack`
- `onNewline()`
- `emitDedentsUntil()`

Expected edits:

```ts
private indentStack: number[] = [0];
private indentUnit: number | null = null;
```

**Step 2: Run the focused lexer tests to preserve the red state**

Run: `npm test -- --run packages/compiler/src/tests/lexer/indentation-errors.spec.ts packages/compiler/src/tests/lexer/indentation-tokens.spec.ts`
Expected: FAIL from the newly added strict-indentation error cases.

**Step 3: Write the minimal implementation**

Implement the strict rule in `packages/compiler/src/lexer/index.ts`:

```ts
if (depth > currentDepth) {
  const previous = this.getLastSignificantTokenType();
  if (previous !== TOKENS.SYMBOLS.colon) {
    this.error("lexer.unexpected_indent");
  }

  const delta = depth - currentDepth;
  if (this.indentUnit === null) {
    this.indentUnit = delta;
  } else if (delta !== this.indentUnit) {
    this.error("lexer.invalid_indent_unit");
  }

  this.indentStack.push(depth);
  this.addToken(TOKENS.SYMBOLS.indent, "<INDENT>");
  return;
}
```

Keep the dedent path strict:

```ts
if (depth < currentDepth) {
  this.emitDedentsUntil(depth);
}
```

Do not add parser-side indentation logic.

**Step 4: Run test to verify it passes**

Run: `npm test -- --run packages/compiler/src/tests/lexer/indentation-errors.spec.ts packages/compiler/src/tests/lexer/indentation-tokens.spec.ts`
Expected: PASS.

**Step 5: Commit**

```bash
git add packages/compiler/src/lexer/index.ts packages/compiler/src/tests/lexer/indentation-errors.spec.ts packages/compiler/src/tests/lexer/indentation-tokens.spec.ts
git commit -m "feat: enforce strict indentation unit"
```

### Task 3: Add explicit diagnostics for strict indentation failures

**Files:**
- Modify: `packages/compiler/src/i18n/locales/en/lexer.ts`
- Modify: `packages/compiler/src/i18n/locales/pt-BR/lexer.ts`
- Modify: `packages/compiler/src/i18n/locales/pt-PT/lexer.ts`
- Modify: `packages/compiler/src/i18n/locales/es/lexer.ts`

**Step 1: Write the failing assertion for the new diagnostic key**

Extend `packages/compiler/src/tests/lexer/indentation-errors.spec.ts` with an assertion that checks the thrown message code once the lexer emits a dedicated exact-indentation error.

Example shape:

```ts
it("reports a dedicated error for inconsistent indent unit reuse", () => {
  const src = [
    "int main():",
    "  if (1 == 1):",
    "    print(1);",
    "      if (2 == 2):",
    "        print(2);",
  ].join("\n");

  expect(() =>
    new Lexer(src, {
      indentationBlock: true,
      locale: "en",
    }).scanTokens(),
  ).toThrow(/indent/);
});
```

**Step 2: Run test to verify it fails or remains too generic**

Run: `npm test -- --run packages/compiler/src/tests/lexer/indentation-errors.spec.ts`
Expected: FAIL or expose that the message is still too generic.

**Step 3: Write minimal implementation**

Add a new locale key such as:

```ts
invalid_indent_unit:
  "Nested blocks must be indented by exactly one inferred indentation unit"
```

Mirror the same key across the other lexer locale files with equivalent wording.

**Step 4: Run test to verify it passes**

Run: `npm test -- --run packages/compiler/src/tests/lexer/indentation-errors.spec.ts`
Expected: PASS.

**Step 5: Commit**

```bash
git add packages/compiler/src/i18n/locales/en/lexer.ts packages/compiler/src/i18n/locales/pt-BR/lexer.ts packages/compiler/src/i18n/locales/pt-PT/lexer.ts packages/compiler/src/i18n/locales/es/lexer.ts packages/compiler/src/tests/lexer/indentation-errors.spec.ts
git commit -m "feat: add strict indentation diagnostics"
```

### Task 4: Verify parser compatibility with strict indentation tokens

**Files:**
- Modify: `packages/compiler/src/tests/grammar/indentation-config.spec.ts`

**Step 1: Write the failing grammar regression test**

Add this test to `packages/compiler/src/tests/grammar/indentation-config.spec.ts`:

```ts
it("parses valid strict-indentation code after the lexer infers the indent unit", () => {
  const code = [
    "int main():",
    "  print(\"start\")",
    "  if(1 < 2):",
    "    print(\"nested\")",
    "  print(\"done\")",
  ].join("\n");

  const lexer = new Lexer(code, {
    locale: "en",
    indentationBlock: true,
  });

  const iterator = new TokenIterator(lexer.scanTokens(), {
    locale: "en",
    grammar: { blockMode: "indentation", semicolonMode: "optional-eol" },
  });

  expect(() => iterator.generateIntermediateCode()).not.toThrow();
});
```

**Step 2: Run test to verify it reflects the current integrated behavior**

Run: `npm test -- --run packages/compiler/src/tests/grammar/indentation-config.spec.ts`
Expected: PASS once the lexer implementation is correct. If it fails, inspect whether the lexer is emitting incorrect `INDENT` or `DEDENT` tokens.

**Step 3: Make minimal adjustments only if needed**

Only touch parser code if the new token stream exposes an existing assumption. Prefer keeping these files unchanged:

- `packages/compiler/src/grammar/syntax/blockStmt.ts`
- `packages/compiler/src/grammar/syntax/listStmt.ts`
- `packages/compiler/src/grammar/syntax/stmt.ts`

**Step 4: Run test to verify it passes**

Run: `npm test -- --run packages/compiler/src/tests/grammar/indentation-config.spec.ts`
Expected: PASS.

**Step 5: Commit**

```bash
git add packages/compiler/src/tests/grammar/indentation-config.spec.ts
git commit -m "test: verify parser compatibility with strict indentation"
```

### Task 5: Run full relevant verification

**Files:**
- Test: `packages/compiler/src/tests/lexer/indentation-errors.spec.ts`
- Test: `packages/compiler/src/tests/lexer/indentation-tokens.spec.ts`
- Test: `packages/compiler/src/tests/grammar/indentation-config.spec.ts`

**Step 1: Run focused compiler verification**

Run: `npm test -- --run packages/compiler/src/tests/lexer/indentation-errors.spec.ts packages/compiler/src/tests/lexer/indentation-tokens.spec.ts packages/compiler/src/tests/grammar/indentation-config.spec.ts`
Expected: PASS.

**Step 2: Run the broader compiler test suite if the project supports it**

Run: `npm test -- --run packages/compiler/src/tests`
Expected: PASS with no regressions in other compiler tests.

**Step 3: Inspect the git diff**

Run: `git diff --stat`
Expected: lexer, locale, and test files only, unless a parser adjustment proved necessary.

**Step 4: Create the final implementation commit**

```bash
git add packages/compiler/src/lexer/index.ts packages/compiler/src/i18n/locales/en/lexer.ts packages/compiler/src/i18n/locales/pt-BR/lexer.ts packages/compiler/src/i18n/locales/pt-PT/lexer.ts packages/compiler/src/i18n/locales/es/lexer.ts packages/compiler/src/tests/lexer/indentation-errors.spec.ts packages/compiler/src/tests/lexer/indentation-tokens.spec.ts packages/compiler/src/tests/grammar/indentation-config.spec.ts
git commit -m "feat: enforce exact indentation blocks"
```
