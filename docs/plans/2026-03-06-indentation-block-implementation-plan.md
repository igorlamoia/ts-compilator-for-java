# Indentation Block Mode Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Implement opt-in Python-style indentation blocks (`NEWLINE`, `INDENT`, `DEDENT`) with `:` block headers when `indentationBlock: true`, while preserving current delimiter-based behavior when disabled.

**Architecture:** Extend lexer config and state to emit structural whitespace tokens in indentation mode, then branch parser block/line handling via grammar config (`blockMode`). Keep semicolon mode behavior unchanged and independent. Add focused lexer/grammar tests plus regressions for default mode.

**Tech Stack:** TypeScript, Vitest, existing lexer/parser/token infrastructure in `packages/compiler`.

---

### Task 1: Add Token And Config Surface

**Files:**
- Modify: `packages/compiler/src/token/constants/symbols.ts`
- Modify: `packages/compiler/src/lexer/config.ts`
- Modify: `packages/compiler/src/token/TokenIterator.ts`
- Modify: `packages/compiler/src/tests/grammar/helpers.ts`

**Step 1: Write the failing test**

Add assertions to `packages/compiler/src/tests/grammar/helpers.ts` usage in a new spec `packages/compiler/src/tests/grammar/indentation-config.spec.ts`:

```ts
const lexer = new Lexer("int main():\n    return 1", {
  locale: "en",
  indentationBlock: true,
});
const iterator = new TokenIterator(lexer.scanTokens(), {
  locale: "en",
  grammar: { blockMode: "indentation", semicolonMode: "optional-eol" },
});
expect(iterator.getBlockMode()).toBe("indentation");
```

**Step 2: Run test to verify it fails**

Run: `cd packages/compiler && npx vitest run src/tests/grammar/indentation-config.spec.ts`
Expected: FAIL with missing config/token mode APIs.

**Step 3: Write minimal implementation**

- Add symbol ids:
```ts
newline: 54,
indent: 55,
dedent: 56,
```
- Extend lexer config:
```ts
indentationBlock?: boolean;
tabWidth?: number;
```
- Extend grammar config:
```ts
blockMode?: "delimited" | "indentation";
```
- Add iterator helper:
```ts
getBlockMode(): "delimited" | "indentation" {
  return this.grammar?.blockMode ?? "delimited";
}
```
- In compile helper, pass lexer + grammar options consistently.

**Step 4: Run test to verify it passes**

Run: `cd packages/compiler && npx vitest run src/tests/grammar/indentation-config.spec.ts`
Expected: PASS.

**Step 5: Commit**

```bash
git add packages/compiler/src/token/constants/symbols.ts \
  packages/compiler/src/lexer/config.ts \
  packages/compiler/src/token/TokenIterator.ts \
  packages/compiler/src/tests/grammar/helpers.ts \
  packages/compiler/src/tests/grammar/indentation-config.spec.ts
git commit -m "feat(grammar): add indentation block mode config surface"
```

### Task 2: Emit Structural Whitespace Tokens In Lexer

**Files:**
- Modify: `packages/compiler/src/lexer/index.ts`
- Modify: `packages/compiler/src/lexer/lexer-helpers.ts`
- Modify: `packages/compiler/src/token/mappings/symbols-tokens.ts`
- Modify: `packages/compiler/src/lexer/config.ts`

**Step 1: Write the failing test**

Create `packages/compiler/src/tests/lexer/indentation-tokens.spec.ts`:

```ts
const src = `int main():\n    int x = 1\n    if (x == 1):\n        print(x)\n    print(2)`;
const tokens = new Lexer(src, { indentationBlock: true, tabWidth: 4 }).scanTokens();
expect(tokens.map((t) => t.type)).toEqual(expect.arrayContaining([
  TOKENS.SYMBOLS.newline,
  TOKENS.SYMBOLS.indent,
  TOKENS.SYMBOLS.dedent,
]));
```

**Step 2: Run test to verify it fails**

Run: `cd packages/compiler && npx vitest run src/tests/lexer/indentation-tokens.spec.ts`
Expected: FAIL because lexer never emits structural tokens.

**Step 3: Write minimal implementation**

In lexer state add:

```ts
private indentationBlock: boolean;
private tabWidth: number;
private indentStack: number[] = [0];
private groupDepth = 0;
private explicitLineContinuation = false;
```

Core methods:

```ts
private onNewline(): void { /* emit NEWLINE + INDENT/DEDENT when logical */ }
private readIndentDepth(start: number): { depth: number; nextIndex: number } { /* tabs=tabWidth */ }
private emitDedentsUntil(depth: number): void { /* pop stack or throw */ }
private isStructuralSuppressed(): boolean { return this.groupDepth > 0 || this.explicitLineContinuation; }
```

Also:
- update group depth when emitting `(`, `)`, `{`, `}`, `[` , `]` symbol tokens
- flush trailing dedents at EOF when indentation mode enabled
- skip blank/comment-only lines for indentation transitions.

**Step 4: Run test to verify it passes**

Run: `cd packages/compiler && npx vitest run src/tests/lexer/indentation-tokens.spec.ts`
Expected: PASS.

**Step 5: Commit**

```bash
git add packages/compiler/src/lexer/index.ts \
  packages/compiler/src/lexer/lexer-helpers.ts \
  packages/compiler/src/token/mappings/symbols-tokens.ts \
  packages/compiler/src/tests/lexer/indentation-tokens.spec.ts
git commit -m "feat(lexer): emit newline indent dedent tokens in indentation mode"
```

### Task 3: Enforce Indentation-Mode Lexical Constraints

**Files:**
- Modify: `packages/compiler/src/lexer/index.ts`
- Modify: `packages/compiler/src/i18n/locales/en/lexer.ts`
- Modify: `packages/compiler/src/i18n/locales/pt-BR/lexer.ts`
- Modify: `packages/compiler/src/i18n/locales/pt-PT/lexer.ts`
- Modify: `packages/compiler/src/i18n/locales/es/lexer.ts`
- Modify: `packages/compiler/src/tests/lexer/block-delimiters.spec.ts`
- Create: `packages/compiler/src/tests/lexer/indentation-errors.spec.ts`

**Step 1: Write the failing test**

Add failures for indentation mode:

```ts
expect(() => new Lexer("int main(){ return 1; }", { indentationBlock: true }).scanTokens()).toThrow();
expect(() => new Lexer("int main():\n  \tprint(1)", { indentationBlock: true, tabWidth: 4 }).scanTokens()).toThrow();
```

**Step 2: Run test to verify it fails**

Run: `cd packages/compiler && npx vitest run src/tests/lexer/indentation-errors.spec.ts`
Expected: FAIL because those inputs are currently accepted.

**Step 3: Write minimal implementation**

- In indentation mode, reject delimiter-based block forms:
  - raw `{` and `}`
  - configured `blockDelimiters` mapping usage
- Validate indentation depth transitions and throw localized errors:
  - inconsistent indentation
  - illegal dedent target
  - unexpected indent.

**Step 4: Run test to verify it passes**

Run: `cd packages/compiler && npx vitest run src/tests/lexer/indentation-errors.spec.ts src/tests/lexer/block-delimiters.spec.ts`
Expected: PASS.

**Step 5: Commit**

```bash
git add packages/compiler/src/lexer/index.ts \
  packages/compiler/src/i18n/locales/en/lexer.ts \
  packages/compiler/src/i18n/locales/pt-BR/lexer.ts \
  packages/compiler/src/i18n/locales/pt-PT/lexer.ts \
  packages/compiler/src/i18n/locales/es/lexer.ts \
  packages/compiler/src/tests/lexer/indentation-errors.spec.ts \
  packages/compiler/src/tests/lexer/block-delimiters.spec.ts
git commit -m "feat(lexer): validate indentation mode constraints and errors"
```

### Task 4: Add Parser Block Helpers For Delimited vs Indentation Modes

**Files:**
- Modify: `packages/compiler/src/grammar/syntax/blockStmt.ts`
- Modify: `packages/compiler/src/grammar/syntax/listStmt.ts`
- Modify: `packages/compiler/src/grammar/syntax/function-call.ts`
- Modify: `packages/compiler/src/grammar/syntax/ifStmt.ts`
- Modify: `packages/compiler/src/grammar/syntax/elsePartStmt.ts`
- Modify: `packages/compiler/src/grammar/syntax/whileStmt.ts`
- Modify: `packages/compiler/src/grammar/syntax/forStmt.ts`
- (If included) Modify: `packages/compiler/src/grammar/syntax/switchStmt.ts`

**Step 1: Write the failing test**

Create `packages/compiler/src/tests/grammar/indentation-blocks.spec.ts` with:

```ts
const source = `
int main():
    int a = 1
    if (a == 1):
        print(a)
    else:
        print(0)
    while (a < 3):
        a = a + 1
`;
expect(() => compileToIr(source, {
  lexer: { indentationBlock: true },
  grammar: { blockMode: "indentation", semicolonMode: "optional-eol" },
})).not.toThrow();
```

**Step 2: Run test to verify it fails**

Run: `cd packages/compiler && npx vitest run src/tests/grammar/indentation-blocks.spec.ts`
Expected: FAIL (parser still expects braces).

**Step 3: Write minimal implementation**

Add mode-aware helpers:

```ts
function consumeBlockStart(iterator: TokenIterator): void {
  if (iterator.getBlockMode() === "delimited") return iterator.consume(TOKENS.SYMBOLS.left_brace);
  iterator.consume(TOKENS.SYMBOLS.colon);
  iterator.consume(TOKENS.SYMBOLS.newline);
  iterator.consume(TOKENS.SYMBOLS.indent);
}

function consumeBlockEnd(iterator: TokenIterator): void {
  if (iterator.getBlockMode() === "delimited") return iterator.consume(TOKENS.SYMBOLS.right_brace);
  iterator.consume(TOKENS.SYMBOLS.dedent);
}
```

Use these in function/if/else/while/for (and switch if included).

**Step 4: Run test to verify it passes**

Run: `cd packages/compiler && npx vitest run src/tests/grammar/indentation-blocks.spec.ts`
Expected: PASS.

**Step 5: Commit**

```bash
git add packages/compiler/src/grammar/syntax/blockStmt.ts \
  packages/compiler/src/grammar/syntax/listStmt.ts \
  packages/compiler/src/grammar/syntax/function-call.ts \
  packages/compiler/src/grammar/syntax/ifStmt.ts \
  packages/compiler/src/grammar/syntax/elsePartStmt.ts \
  packages/compiler/src/grammar/syntax/whileStmt.ts \
  packages/compiler/src/grammar/syntax/forStmt.ts \
  packages/compiler/src/tests/grammar/indentation-blocks.spec.ts
git commit -m "feat(grammar): support indentation-based block parsing"
```

### Task 5: Keep Semicolon Modes Intact With Newline Tokens

**Files:**
- Modify: `packages/compiler/src/grammar/syntax/statementTerminator.ts`
- Modify: `packages/compiler/src/grammar/syntax/stmt.ts`
- Modify: `packages/compiler/src/tests/grammar/semicolon.spec.ts`
- Modify: `packages/compiler/src/tests/grammar/helpers.ts`

**Step 1: Write the failing test**

Add mode-interaction coverage:

```ts
expect(() => compileToIr(src, {
  lexer: { indentationBlock: true },
  grammar: { blockMode: "indentation", semicolonMode: "required" },
})).toThrow(/Unexpected token/);

expect(() => compileToIr(src, {
  lexer: { indentationBlock: true },
  grammar: { blockMode: "indentation", semicolonMode: "optional-eol" },
})).not.toThrow();
```

**Step 2: Run test to verify it fails**

Run: `cd packages/compiler && npx vitest run src/tests/grammar/semicolon.spec.ts`
Expected: FAIL for at least one new scenario.

**Step 3: Write minimal implementation**

- In optional mode, allow `NEWLINE` as statement boundary in indentation mode.
- In required mode, always require `;` regardless of newline.
- Ensure `stmt` consumes stray `NEWLINE` similarly to existing semicolon-noop handling.

**Step 4: Run test to verify it passes**

Run: `cd packages/compiler && npx vitest run src/tests/grammar/semicolon.spec.ts`
Expected: PASS.

**Step 5: Commit**

```bash
git add packages/compiler/src/grammar/syntax/statementTerminator.ts \
  packages/compiler/src/grammar/syntax/stmt.ts \
  packages/compiler/src/tests/grammar/semicolon.spec.ts \
  packages/compiler/src/tests/grammar/helpers.ts
git commit -m "feat(grammar): preserve semicolon modes with indentation tokens"
```

### Task 6: Add Colon/Header Validation Errors

**Files:**
- Modify: `packages/compiler/src/i18n/locales/en/grammar.ts`
- Modify: `packages/compiler/src/i18n/locales/pt-BR/grammar.ts`
- Modify: `packages/compiler/src/i18n/locales/pt-PT/grammar.ts`
- Modify: `packages/compiler/src/i18n/locales/es/grammar.ts`
- Create: `packages/compiler/src/tests/grammar/indentation-errors.spec.ts`

**Step 1: Write the failing test**

```ts
expect(() => compileToIr(`int main()\n    return 1`, {
  lexer: { indentationBlock: true },
  grammar: { blockMode: "indentation" },
})).toThrow(/:/);

expect(() => compileToIr(`int main(): return 1`, {
  lexer: { indentationBlock: true },
  grammar: { blockMode: "indentation" },
})).toThrow(/NEWLINE/);
```

**Step 2: Run test to verify it fails**

Run: `cd packages/compiler && npx vitest run src/tests/grammar/indentation-errors.spec.ts`
Expected: FAIL with generic unexpected token behavior.

**Step 3: Write minimal implementation**

- Throw specific parser errors for:
  - missing `:` after block header
  - missing newline+indent after `:`
  - missing dedent when closing block.
- Add localized messages for new error keys.

**Step 4: Run test to verify it passes**

Run: `cd packages/compiler && npx vitest run src/tests/grammar/indentation-errors.spec.ts`
Expected: PASS.

**Step 5: Commit**

```bash
git add packages/compiler/src/i18n/locales/en/grammar.ts \
  packages/compiler/src/i18n/locales/pt-BR/grammar.ts \
  packages/compiler/src/i18n/locales/pt-PT/grammar.ts \
  packages/compiler/src/i18n/locales/es/grammar.ts \
  packages/compiler/src/tests/grammar/indentation-errors.spec.ts
git commit -m "feat(grammar): add indentation-mode block header diagnostics"
```

### Task 7: Add Continuation And Mixed Indentation Coverage

**Files:**
- Modify: `packages/compiler/src/tests/lexer/indentation-tokens.spec.ts`
- Modify: `packages/compiler/src/tests/grammar/indentation-blocks.spec.ts`

**Step 1: Write the failing test**

Add continuation scenarios:

```ts
const grouped = `int main():\n    int a = (1 +\n        2)\n    print(a)`;
expect(() => compileToIr(grouped, opts)).not.toThrow();

const escaped = `int main():\n    int a = 1 + \\\n        2\n    print(a)`;
expect(() => compileToIr(escaped, opts)).not.toThrow();
```

**Step 2: Run test to verify it fails**

Run: `cd packages/compiler && npx vitest run src/tests/lexer/indentation-tokens.spec.ts src/tests/grammar/indentation-blocks.spec.ts`
Expected: FAIL at continuation handling.

**Step 3: Write minimal implementation**

- Ensure lexer suppresses structural newline behavior for grouped expressions and explicit `\` continuation.
- Ensure newline resumes normal structural handling once continuation ends.

**Step 4: Run test to verify it passes**

Run: `cd packages/compiler && npx vitest run src/tests/lexer/indentation-tokens.spec.ts src/tests/grammar/indentation-blocks.spec.ts`
Expected: PASS.

**Step 5: Commit**

```bash
git add packages/compiler/src/tests/lexer/indentation-tokens.spec.ts \
  packages/compiler/src/tests/grammar/indentation-blocks.spec.ts \
  packages/compiler/src/lexer/index.ts
git commit -m "test(lexer): cover python-style line continuation in indentation mode"
```

### Task 8: Full Regression Sweep And Docs

**Files:**
- Modify: `packages/compiler/README.md`
- Modify: `docs/plans/2026-03-06-indentation-block-design.md` (link implementation status if needed)

**Step 1: Write the failing test**

No new failing unit test in this task; regression verification task.

**Step 2: Run test suites**

Run:

```bash
cd packages/compiler
npx vitest run src/tests/lexer
npx vitest run src/tests/grammar
npx vitest run src/tests/tokens
```

Expected: all PASS.

**Step 3: Write minimal documentation implementation**

Document:
- `indentationBlock` and `tabWidth` lexer options
- parser `blockMode` usage
- examples for delimited mode vs indentation mode
- semicolon mode interaction notes.

**Step 4: Re-run quick targeted tests**

Run: `cd packages/compiler && npx vitest run src/tests/grammar/indentation-blocks.spec.ts src/tests/grammar/semicolon.spec.ts`
Expected: PASS.

**Step 5: Commit**

```bash
git add packages/compiler/README.md
git commit -m "docs(compiler): document indentation block mode"
```

## Final Verification Checklist

- `indentationBlock: false|undefined` keeps current behavior unchanged.
- `indentationBlock: true` requires `:` + indentation blocks.
- `{}`, `begin/end` rejected in indentation mode.
- Tabs/spaces accepted only when normalized depth is consistent (`tabWidth=4`).
- Semicolon mode behavior unchanged.
- New i18n keys exist in all active locales.
- Full lexer + grammar + tokens test suites pass.
