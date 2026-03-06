# Switch-Case Grammar Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Add `switch/case/default` parsing with C-style fallthrough, int/string case labels, and correct `break` semantics in compiler grammar/IR.

**Architecture:** Extend lexer/token tables for new keywords and `:`; add a dedicated `switchStmt` parser that emits a linear dispatch chain (`==`, `IF`, `JUMP`, `LABEL`) and ordered case/default bodies for natural fallthrough. Extend flow-control context so `break` resolves to the nearest breakable construct (loop or switch), while `continue` remains loop-only.

**Tech Stack:** TypeScript, Vitest, existing compiler lexer/parser/IR emitter.

---

### Task 1: Add token constants for switch syntax

**Files:**
- Modify: `packages/compiler/src/token/constants/reserveds.ts`
- Modify: `packages/compiler/src/token/constants/symbols.ts`
- Test: `packages/compiler/src/tests/tokens/index.spec.ts`

**Step 1: Write the failing test**

```ts
it("should expose switch/case/default and colon tokens", () => {
  expect(TOKENS.BY_DESCRIPTION["switch"]).toBeDefined();
  expect(TOKENS.BY_DESCRIPTION["case"]).toBeDefined();
  expect(TOKENS.BY_DESCRIPTION["default"]).toBeDefined();
  expect(TOKENS.BY_DESCRIPTION["colon"]).toBeDefined();
});
```

**Step 2: Run test to verify it fails**

Run: `npm run test -- packages/compiler/src/tests/tokens/index.spec.ts`
Expected: FAIL on missing token keys.

**Step 3: Write minimal implementation**

```ts
export const RESERVEDS = {
  // ...existing
  switch: 50,
  case: 51,
  default: 52,
};

export const SYMBOLS = {
  // ...existing
  colon: 44,
};
```

**Step 4: Run test to verify it passes**

Run: `npm run test -- packages/compiler/src/tests/tokens/index.spec.ts`
Expected: PASS.

**Step 5: Commit**

```bash
git add packages/compiler/src/token/constants/reserveds.ts \
  packages/compiler/src/token/constants/symbols.ts \
  packages/compiler/src/tests/tokens/index.spec.ts
git commit -m "feat(tokens): add switch/case/default and colon token constants"
```

### Task 2: Recognize `:` and new keywords in lexer

**Files:**
- Modify: `packages/compiler/src/token/mappings/symbols-tokens.ts`
- Test: `packages/compiler/src/tests/lexer/switch.spec.ts` (new)

**Step 1: Write the failing test**

```ts
it("tokenizes switch/case/default with colon", () => {
  const lexer = new Lexer('switch(x){case 1: print("a"); default: break;}');
  const tokens = lexer.scanTokens();
  const types = tokens.map((t) => t.type);

  expect(types).toContain(TOKENS.RESERVEDS.switch);
  expect(types).toContain(TOKENS.RESERVEDS.case);
  expect(types).toContain(TOKENS.RESERVEDS.default);
  expect(types).toContain(TOKENS.SYMBOLS.colon);
});
```

**Step 2: Run test to verify it fails**

Run: `npm run test -- packages/compiler/src/tests/lexer/switch.spec.ts`
Expected: FAIL because `:` is unrecognized.

**Step 3: Write minimal implementation**

```ts
export const SYMBOLS_TOKENS_MAP: TTokenMap = {
  // ...existing
  ":": (lexer) => lexer.addToken(TOKENS.SYMBOLS.colon),
};
```

**Step 4: Run test to verify it passes**

Run: `npm run test -- packages/compiler/src/tests/lexer/switch.spec.ts`
Expected: PASS.

**Step 5: Commit**

```bash
git add packages/compiler/src/token/mappings/symbols-tokens.ts \
  packages/compiler/src/tests/lexer/switch.spec.ts
git commit -m "feat(lexer): tokenize colon for switch-case syntax"
```

### Task 3: Add switch context to iterator for break resolution

**Files:**
- Modify: `packages/compiler/src/token/TokenIterator.ts`
- Test: `packages/compiler/src/tests/grammar/switch-context.spec.ts` (new)

**Step 1: Write the failing test**

```ts
it("prefers nearest breakable context for break label", () => {
  const it = new TokenIterator([]);
  it.pushLoopContext("loopEnd", "loopContinue");
  it.pushSwitchContext("switchEnd");
  expect(it.getCurrentBreakLabel()).toBe("switchEnd");
});
```

**Step 2: Run test to verify it fails**

Run: `npm run test -- packages/compiler/src/tests/grammar/switch-context.spec.ts`
Expected: FAIL (missing switch context APIs).

**Step 3: Write minimal implementation**

```ts
interface SwitchContext { breakLabel: string }
private switchStack: SwitchContext[] = [];

pushSwitchContext(breakLabel: string): void {
  this.switchStack.push({ breakLabel });
}

popSwitchContext(): void {
  this.switchStack.pop();
}

getCurrentBreakLabel(): string | null {
  const fromSwitch = this.switchStack[this.switchStack.length - 1]?.breakLabel;
  if (fromSwitch) return fromSwitch;
  const fromLoop = this.loopStack[this.loopStack.length - 1]?.breakLabel;
  return fromLoop ?? null;
}
```

**Step 4: Run test to verify it passes**

Run: `npm run test -- packages/compiler/src/tests/grammar/switch-context.spec.ts`
Expected: PASS.

**Step 5: Commit**

```bash
git add packages/compiler/src/token/TokenIterator.ts \
  packages/compiler/src/tests/grammar/switch-context.spec.ts
git commit -m "feat(parser): add switch break context to token iterator"
```

### Task 4: Parse and emit switch statement control flow

**Files:**
- Create: `packages/compiler/src/grammar/syntax/switchStmt.ts`
- Modify: `packages/compiler/src/grammar/syntax/stmt.ts`
- Test: `packages/compiler/src/tests/grammar/switch-stmt.spec.ts` (new)

**Step 1: Write the failing test**

```ts
it("emits dispatch and case labels for int/string switch", () => {
  const src = `int main(){ int x = 1; switch(x){ case 1: print("a"); break; case "1": print("b"); default: print("d"); } }`;
  const ir = compileToIr(src);

  expect(ir.some((i) => i.op === "IF")).toBe(true);
  expect(ir.some((i) => i.op === "LABEL")).toBe(true);
  expect(ir.some((i) => i.op === "JUMP")).toBe(true);
});
```

**Step 2: Run test to verify it fails**

Run: `npm run test -- packages/compiler/src/tests/grammar/switch-stmt.spec.ts`
Expected: FAIL on unexpected `switch` statement.

**Step 3: Write minimal implementation**

```ts
export function switchStmt(iterator: TokenIterator): void {
  iterator.consume(TOKENS.RESERVEDS.switch);
  iterator.consume(TOKENS.SYMBOLS.left_paren);
  const switchValue = exprStmt(iterator);
  iterator.consume(TOKENS.SYMBOLS.right_paren);
  iterator.consume(TOKENS.SYMBOLS.left_brace);

  // parse case/default metadata, then emit chained checks + labels + bodies
  // push switch context so break; jumps to switchEnd
  // pop switch context before closing

  iterator.consume(TOKENS.SYMBOLS.right_brace);
}
```

In `stmt.ts` add dispatch:

```ts
[RESERVEDS.switch]: switchStmt,
```

**Step 4: Run test to verify it passes**

Run: `npm run test -- packages/compiler/src/tests/grammar/switch-stmt.spec.ts`
Expected: PASS.

**Step 5: Commit**

```bash
git add packages/compiler/src/grammar/syntax/switchStmt.ts \
  packages/compiler/src/grammar/syntax/stmt.ts \
  packages/compiler/src/tests/grammar/switch-stmt.spec.ts
git commit -m "feat(grammar): add switch-case statement parsing and IR emission"
```

### Task 5: Enforce case/default validation rules

**Files:**
- Modify: `packages/compiler/src/grammar/syntax/switchStmt.ts`
- Modify: `packages/compiler/src/i18n/locales/en/grammar.ts`
- Modify: `packages/compiler/src/i18n/locales/pt-BR/grammar.ts`
- Modify: `packages/compiler/src/i18n/locales/pt-PT/grammar.ts`
- Modify: `packages/compiler/src/i18n/locales/es/grammar.ts`
- Test: `packages/compiler/src/tests/grammar/switch-errors.spec.ts` (new)

**Step 1: Write the failing tests**

```ts
it("rejects duplicate case literal", () => {
  expect(() => compileToIr(`int main(){ switch(1){ case 1: break; case 1: break; } }`))
    .toThrow(/duplicate/i);
});

it("rejects invalid case literal expression", () => {
  expect(() => compileToIr(`int main(){ switch(1){ case 1+2: break; } }`))
    .toThrow(/invalid case literal/i);
});
```

**Step 2: Run tests to verify they fail**

Run: `npm run test -- packages/compiler/src/tests/grammar/switch-errors.spec.ts`
Expected: FAIL (no validation yet).

**Step 3: Write minimal implementation**

```ts
// in switch parser
// - track literal set for duplicate detection
// - allow only NUMint/NUMoct/NUMhex/STR tokens for case labels
// - throw grammar.* errors for violations
```

Add i18n keys:
- `case_outside_switch`
- `default_outside_switch`
- `duplicate_case_label`
- `invalid_case_literal`

**Step 4: Run tests to verify they pass**

Run: `npm run test -- packages/compiler/src/tests/grammar/switch-errors.spec.ts`
Expected: PASS.

**Step 5: Commit**

```bash
git add packages/compiler/src/grammar/syntax/switchStmt.ts \
  packages/compiler/src/i18n/locales/en/grammar.ts \
  packages/compiler/src/i18n/locales/pt-BR/grammar.ts \
  packages/compiler/src/i18n/locales/pt-PT/grammar.ts \
  packages/compiler/src/i18n/locales/es/grammar.ts \
  packages/compiler/src/tests/grammar/switch-errors.spec.ts
git commit -m "feat(grammar): validate switch case literals and duplicates"
```

### Task 6: Verify fallthrough and break behavior

**Files:**
- Modify: `packages/compiler/src/tests/grammar/switch-stmt.spec.ts`

**Step 1: Write failing tests**

```ts
it("supports fallthrough when break is omitted", () => {
  const src = `int main(){ int x=1; switch(x){ case 1: print("a"); case 2: print("b"); break; } }`;
  const ir = compileToIr(src);
  // assert case1 label is followed by case2 label path without forced jump
  expect(containsForcedJumpBetweenCase1AndCase2(ir)).toBe(false);
});

it("break exits switch to end label", () => {
  const src = `int main(){ int x=1; switch(x){ case 1: break; default: print("d"); } }`;
  const ir = compileToIr(src);
  expect(hasJumpToSwitchEndAfterCase1(ir)).toBe(true);
});
```

**Step 2: Run tests to verify they fail**

Run: `npm run test -- packages/compiler/src/tests/grammar/switch-stmt.spec.ts`
Expected: FAIL on missing/incorrect flow behavior.

**Step 3: Write minimal implementation**

```ts
// ensure case/default bodies are emitted in source order and no implicit jump
// ensure breakStmt resolves to current switch end label when inside switch
```

**Step 4: Run tests to verify they pass**

Run: `npm run test -- packages/compiler/src/tests/grammar/switch-stmt.spec.ts`
Expected: PASS.

**Step 5: Commit**

```bash
git add packages/compiler/src/tests/grammar/switch-stmt.spec.ts \
  packages/compiler/src/grammar/syntax/switchStmt.ts \
  packages/compiler/src/grammar/syntax/breakStmt.ts \
  packages/compiler/src/token/TokenIterator.ts
git commit -m "test(grammar): cover switch fallthrough and break flow"
```

### Task 7: Update grammar documentation

**Files:**
- Modify: `packages/compiler/src/grammar/ast/README.md`

**Step 1: Write failing check (manual expectation)**

Expected doc additions:
- `<switchStmt>` production in `<stmt>` alternatives
- case/default productions and `:` syntax
- note about fallthrough behavior

**Step 2: Verify current doc is outdated**

Run: `rg -n "switch|case|default|:" packages/compiler/src/grammar/ast/README.md`
Expected: no switch section found.

**Step 3: Write minimal implementation**

```md
<stmt> -> ... | <switchStmt> | ...
<switchStmt> -> 'switch' '(' <expr> ')' '{' <caseList> <defaultOpt> '}' ;
<caseClause> -> 'case' <caseLiteral> ':' <stmtList> ;
<defaultOpt> -> 'default' ':' <stmtList> | & ;
```

**Step 4: Re-verify doc contains switch grammar**

Run: `rg -n "switch|case|default|caseLiteral" packages/compiler/src/grammar/ast/README.md`
Expected: matches found.

**Step 5: Commit**

```bash
git add packages/compiler/src/grammar/ast/README.md
git commit -m "docs(grammar): document switch-case productions"
```

### Task 8: Full verification before completion

**Files:**
- Modify as needed from prior tasks only

**Step 1: Run focused test suites**

Run: `npm run test -- packages/compiler/src/tests/lexer/switch.spec.ts packages/compiler/src/tests/grammar/switch-context.spec.ts packages/compiler/src/tests/grammar/switch-stmt.spec.ts packages/compiler/src/tests/grammar/switch-errors.spec.ts`
Expected: PASS.

**Step 2: Run existing baseline suites**

Run: `npm run test -- packages/compiler/src/tests/lexer packages/compiler/src/tests/tokens`
Expected: PASS and no regressions.

**Step 3: Inspect final diff for accidental changes**

Run: `git status --short && git diff --name-only`
Expected: only intended compiler files changed.

**Step 4: Create integration commit (if doing squashed final commit)**

```bash
git add packages/compiler/src
git commit -m "feat(grammar): implement switch-case with fallthrough and validations"
```

**Step 5: Record verification evidence in PR/notes**

Include:
- exact commands run
- pass/fail summary
- known limitations (if any)
