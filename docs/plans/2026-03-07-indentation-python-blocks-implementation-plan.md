# Python-like Indentation Blocks Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Make indentation mode fully Python-like across all block constructs (including `switch`) while keeping semicolon enforcement controlled by `semicolonMode`.

**Architecture:** Add shared mode-aware parser helpers for block entry/exit and block termination, then migrate all block-owning grammar sites to those helpers. Keep lexer as the source of indentation structure (`NEWLINE`, `INDENT`, `DEDENT`) and delimiter rejection in indentation mode. Extend grammar tests first (fail), then implement minimal parser changes to pass.

**Tech Stack:** TypeScript, Vitest, existing compiler lexer/parser pipeline (`Lexer`, `TokenIterator`, grammar syntax modules).

---

### Task 1: Add failing grammar tests for indentation-mode blocks and switch

**Files:**
- Modify: `packages/compiler/src/tests/grammar/indentation-config.spec.ts`
- Modify: `packages/compiler/src/tests/grammar/switch-stmt.spec.ts`
- Test: `packages/compiler/src/tests/grammar/helpers.ts`

**Step 1: Write the failing test**

```ts
it("parses function/if/while/for blocks in indentation mode", () => {
  const source = `
    int main():
        int x = 1
        if (x == 1):
            print(x)
        while (x < 3):
            x = x + 1
        for (x = 0; x < 2; x++):
            print(x)
  `;

  expect(() =>
    compileToIr(source, {
      lexer: { indentationBlock: true },
      grammar: { blockMode: "indentation", semicolonMode: "optional-eol" },
    }),
  ).not.toThrow();
});
```

```ts
it("parses switch/case/default in indentation mode", () => {
  const source = `
    int main():
        int x = 1
        switch (x):
            case 1:
                print("one")
                break
            default:
                print("default")
  `;

  expect(() =>
    compileToIr(source, {
      lexer: { indentationBlock: true },
      grammar: { blockMode: "indentation", semicolonMode: "optional-eol" },
    }),
  ).not.toThrow();
});
```

**Step 2: Run test to verify it fails**

Run: `npm --workspace @ts-compilator-for-java/compiler test -- src/tests/grammar/indentation-config.spec.ts src/tests/grammar/switch-stmt.spec.ts`
Expected: FAIL with unexpected token around brace-only block parsing or switch body parsing.

**Step 3: Write minimal implementation**
- No implementation in this task.

**Step 4: Run test to verify it still fails (baseline locked)**

Run: `npm --workspace @ts-compilator-for-java/compiler test -- src/tests/grammar/indentation-config.spec.ts src/tests/grammar/switch-stmt.spec.ts`
Expected: FAIL remains consistent.

**Step 5: Commit**

```bash
git add packages/compiler/src/tests/grammar/indentation-config.spec.ts packages/compiler/src/tests/grammar/switch-stmt.spec.ts
git commit -m "test(grammar): add failing indentation-mode block and switch coverage"
```

### Task 2: Add failing tests for indentation-mode semicolon interaction and error paths

**Files:**
- Modify: `packages/compiler/src/tests/grammar/semicolon.spec.ts`
- Modify: `packages/compiler/src/tests/grammar/indentation-config.spec.ts`

**Step 1: Write the failing test**

```ts
it("requires semicolon in indentation mode when semicolonMode is required", () => {
  const source = `
    int main():
        int x = 1
        print(x)
  `;

  expect(() =>
    compileToIr(source, {
      lexer: { indentationBlock: true },
      grammar: { blockMode: "indentation", semicolonMode: "required" },
    }),
  ).toThrow(/Unexpected token/);
});
```

```ts
it("fails indentation mode when block header is missing colon", () => {
  const source = `
    int main()
        print(1)
  `;

  expect(() =>
    compileToIr(source, {
      lexer: { indentationBlock: true },
      grammar: { blockMode: "indentation", semicolonMode: "optional-eol" },
    }),
  ).toThrow(/Unexpected token/);
});
```

**Step 2: Run test to verify it fails**

Run: `npm --workspace @ts-compilator-for-java/compiler test -- src/tests/grammar/semicolon.spec.ts src/tests/grammar/indentation-config.spec.ts`
Expected: FAIL on one or both new tests.

**Step 3: Write minimal implementation**
- No implementation in this task.

**Step 4: Run test to verify it still fails (baseline locked)**

Run: `npm --workspace @ts-compilator-for-java/compiler test -- src/tests/grammar/semicolon.spec.ts src/tests/grammar/indentation-config.spec.ts`
Expected: FAIL remains consistent.

**Step 5: Commit**

```bash
git add packages/compiler/src/tests/grammar/semicolon.spec.ts packages/compiler/src/tests/grammar/indentation-config.spec.ts
git commit -m "test(grammar): add failing indentation semicolon and colon error tests"
```

### Task 3: Implement shared mode-aware block helper and migrate core block entry points

**Files:**
- Modify: `packages/compiler/src/grammar/syntax/blockStmt.ts`
- Modify: `packages/compiler/src/grammar/syntax/listStmt.ts`
- Modify: `packages/compiler/src/grammar/syntax/function-call.ts`
- Modify: `packages/compiler/src/grammar/syntax/stmt.ts`
- Modify: `packages/compiler/src/grammar/syntax/elsePartStmt.ts`
- Modify: `packages/compiler/src/grammar/syntax/ifStmt.ts`
- Modify: `packages/compiler/src/grammar/syntax/whileStmt.ts`
- Modify: `packages/compiler/src/grammar/syntax/forStmt.ts`

**Step 1: Write the failing test**
- Re-run tests added in Tasks 1-2.

**Step 2: Run test to verify it fails**

Run: `npm --workspace @ts-compilator-for-java/compiler test -- src/tests/grammar/indentation-config.spec.ts src/tests/grammar/semicolon.spec.ts`
Expected: FAIL.

**Step 3: Write minimal implementation**

```ts
// blockStmt.ts (shape)
export function blockStmt(iterator: TokenIterator): void {
  if (iterator.getBlockMode() === "indentation") {
    iterator.consume(TOKENS.SYMBOLS.colon);
    iterator.consume(TOKENS.SYMBOLS.newline);
    iterator.consume(TOKENS.SYMBOLS.indent);
    listStmt(iterator);
    iterator.consume(TOKENS.SYMBOLS.dedent);
    return;
  }

  iterator.consume(TOKENS.SYMBOLS.left_brace);
  listStmt(iterator);
  iterator.consume(TOKENS.SYMBOLS.right_brace);
}
```

```ts
// listStmt.ts (mode-aware stop condition)
while (iterator.hasNext()) {
  if (iterator.getBlockMode() === "indentation") {
    if (iterator.match(TOKENS.SYMBOLS.dedent)) break;
  } else {
    if (iterator.match(TOKENS.SYMBOLS.right_brace)) break;
  }
  stmt(iterator);
}
```

**Step 4: Run test to verify it passes**

Run: `npm --workspace @ts-compilator-for-java/compiler test -- src/tests/grammar/indentation-config.spec.ts src/tests/grammar/semicolon.spec.ts`
Expected: PASS for updated indentation-related tests.

**Step 5: Commit**

```bash
git add packages/compiler/src/grammar/syntax/blockStmt.ts packages/compiler/src/grammar/syntax/listStmt.ts packages/compiler/src/grammar/syntax/function-call.ts packages/compiler/src/grammar/syntax/stmt.ts packages/compiler/src/grammar/syntax/elsePartStmt.ts packages/compiler/src/grammar/syntax/ifStmt.ts packages/compiler/src/grammar/syntax/whileStmt.ts packages/compiler/src/grammar/syntax/forStmt.ts
git commit -m "feat(grammar): make core blocks mode-aware for indentation parsing"
```

### Task 4: Make switch parser mode-aware for indentation sections

**Files:**
- Modify: `packages/compiler/src/grammar/syntax/switchStmt.ts`
- Modify: `packages/compiler/src/grammar/syntax/stmt.ts`
- Test: `packages/compiler/src/tests/grammar/switch-stmt.spec.ts`

**Step 1: Write the failing test**
- Re-run indentation switch tests from Task 1.

**Step 2: Run test to verify it fails**

Run: `npm --workspace @ts-compilator-for-java/compiler test -- src/tests/grammar/switch-stmt.spec.ts`
Expected: FAIL in indentation-mode switch parsing.

**Step 3: Write minimal implementation**

```ts
// switchStmt.ts (shape)
if (iterator.getBlockMode() === "indentation") {
  iterator.consume(SYMBOLS.colon);
  iterator.consume(SYMBOLS.newline);
  iterator.consume(SYMBOLS.indent);

  while (!iterator.match(SYMBOLS.dedent)) {
    if (iterator.match(RESERVEDS.case)) {
      // consume case literal + colon, parse section body until case/default/dedent
      continue;
    }
    if (iterator.match(RESERVEDS.default)) {
      // consume default + colon, parse section body until case/default/dedent
      continue;
    }
    iterator.throwError("grammar.unexpected_token", iterator.peek().line, iterator.peek().column, {
      lexeme: iterator.peek().lexeme,
      line: iterator.peek().line,
      column: iterator.peek().column,
    });
  }

  iterator.consume(SYMBOLS.dedent);
} else {
  // existing brace-based behavior
}
```

**Step 4: Run test to verify it passes**

Run: `npm --workspace @ts-compilator-for-java/compiler test -- src/tests/grammar/switch-stmt.spec.ts src/tests/grammar/indentation-config.spec.ts`
Expected: PASS for indentation and existing switch assertions.

**Step 5: Commit**

```bash
git add packages/compiler/src/grammar/syntax/switchStmt.ts packages/compiler/src/grammar/syntax/stmt.ts packages/compiler/src/tests/grammar/switch-stmt.spec.ts
git commit -m "feat(grammar): support indentation-mode switch case/default sections"
```

### Task 5: Verify full regression and document behavior

**Files:**
- Modify: `packages/compiler/src/tests/grammar/block-delimiters.spec.ts`
- Modify: `packages/compiler/src/tests/lexer/indentation-errors.spec.ts`
- Modify: `docs/plans/2026-03-07-indentation-python-blocks-design.md` (status notes only if needed)

**Step 1: Write the failing test**

```ts
it("rejects configured begin/end delimiters in indentation mode", () => {
  expect(() =>
    new Lexer("int main() begin\n  print(1)\nend", {
      indentationBlock: true,
      blockDelimiters: { open: "begin", close: "end" },
      locale: "en",
    }).scanTokens(),
  ).toThrow();
});
```

**Step 2: Run test to verify it fails**

Run: `npm --workspace @ts-compilator-for-java/compiler test -- src/tests/grammar/block-delimiters.spec.ts src/tests/lexer/indentation-errors.spec.ts`
Expected: FAIL before assertion alignment (if messages/spec mismatch).

**Step 3: Write minimal implementation**
- Adjust tests and parser integration only as needed; keep lexer rejection behavior unchanged.

**Step 4: Run test to verify it passes**

Run: `npm --workspace @ts-compilator-for-java/compiler test`
Expected: PASS all compiler tests.

**Step 5: Commit**

```bash
git add packages/compiler/src/tests/grammar/block-delimiters.spec.ts packages/compiler/src/tests/lexer/indentation-errors.spec.ts docs/plans/2026-03-07-indentation-python-blocks-design.md
git commit -m "test(grammar): finalize indentation mode delimiter rejection coverage"
```
