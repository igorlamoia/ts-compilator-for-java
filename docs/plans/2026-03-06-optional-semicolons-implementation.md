# Optional Semicolons Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Add JS-like optional statement semicolons at EOL/`}`/EOF in `packages/compiler`, while keeping grammar-required `for` semicolons mandatory and supporting strict required-semicolon mode.

**Architecture:** Keep lexer unchanged and implement semicolon omission rules in parser only. Add grammar parser config to `TokenIterator`, then route statement terminator checks through a single helper (`consumeStmtTerminator`) to centralize behavior. Preserve existing `iterator.unexpected_token` error path and keep `forStmt` semicolon consumption explicit.

**Tech Stack:** TypeScript, Vitest, existing lexer/parser/token iterator architecture in `packages/compiler`.

---

### Task 1: Add parser config plumbing for semicolon mode

**Files:**
- Modify: `packages/compiler/src/token/TokenIterator.ts`
- Modify: `packages/compiler/src/tests/grammar/helpers.ts`

**Step 1: Write the failing test**

Add a new helper-level test case setup in grammar tests that tries to compile with strict mode config and expects missing `;` to fail (test file added in Task 3).

**Step 2: Run test to verify it fails**

Run: `npm run test -- packages/compiler/src/tests/grammar/semicolon.spec.ts`
Expected: FAIL because `TokenIterator`/helpers do not yet accept parser semicolon mode config.

**Step 3: Write minimal implementation**

In `TokenIterator.ts`:
- Add parser config type, e.g.:

```ts
export type GrammarConfig = {
  semicolonMode?: "optional-eol" | "required";
};
```

- Extend constructor signature to accept config object with locale + grammar options while preserving existing call sites.
- Add method:

```ts
getSemicolonMode(): "optional-eol" | "required"
```

that defaults to `"optional-eol"`.

In `helpers.ts`:
- Extend `compileToIr(source, options?)` to pass grammar config into `TokenIterator`.

**Step 4: Run test to verify it passes**

Run: `npm run test -- packages/compiler/src/tests/grammar/semicolon.spec.ts`
Expected: Previously failing config-related assertions now pass (other missing behavior may still fail).

**Step 5: Commit**

```bash
git add packages/compiler/src/token/TokenIterator.ts packages/compiler/src/tests/grammar/helpers.ts
git commit -m "feat(grammar): add parser semicolon mode config plumbing"
```

### Task 2: Introduce shared statement terminator helper

**Files:**
- Create: `packages/compiler/src/grammar/syntax/statementTerminator.ts`
- Test: `packages/compiler/src/tests/grammar/semicolon.spec.ts`

**Step 1: Write the failing test**

In `semicolon.spec.ts`, add focused tests for helper-driven behavior via real parses:
- Optional mode accepts newline-terminated statement without `;`.
- Optional mode rejects same-line consecutive statements without `;`.

Example test source:

```ts
int main() {
  int a = 1
  print(a);
}
```

and

```ts
int main() {
  int a = 1 print(a);
}
```

**Step 2: Run test to verify it fails**

Run: `npm run test -- packages/compiler/src/tests/grammar/semicolon.spec.ts`
Expected: FAIL because no shared terminator helper exists and grammar still hard-requires `;`.

**Step 3: Write minimal implementation**

Implement `consumeStmtTerminator(iterator, options?)`:
- Consume `;` if present.
- If required mode (`iterator.getSemicolonMode() === "required"` or `forceRequired`) and missing `;`, throw using existing `iterator.consume(TOKENS.SYMBOLS.semicolon)` path.
- In optional mode, allow omission only if next token is `}` or EOF or next token line > previous consumed token line.
- Otherwise throw same unexpected token error.

Use `iterator.peekAt(-1)` (or add a safe `previous()` accessor) for previous token line.

**Step 4: Run test to verify it passes**

Run: `npm run test -- packages/compiler/src/tests/grammar/semicolon.spec.ts`
Expected: line-based cases pass.

**Step 5: Commit**

```bash
git add packages/compiler/src/grammar/syntax/statementTerminator.ts packages/compiler/src/tests/grammar/semicolon.spec.ts
git commit -m "feat(grammar): add optional-eol statement terminator helper"
```

### Task 3: Replace statement-level semicolon consumption with helper

**Files:**
- Modify: `packages/compiler/src/grammar/syntax/declarationStmt.ts`
- Modify: `packages/compiler/src/grammar/syntax/ioStmt.ts`
- Modify: `packages/compiler/src/grammar/syntax/returnStmt.ts`
- Modify: `packages/compiler/src/grammar/syntax/breakStmt.ts`
- Modify: `packages/compiler/src/grammar/syntax/continueStmt.ts`
- Modify: `packages/compiler/src/grammar/syntax/stmt.ts`

**Step 1: Write the failing test**

Add tests in `semicolon.spec.ts` for each statement kind without `;` at EOL:
- declaration, assignment, function call statement, prefix/postfix increment statement, print, scan, return, break, continue.

**Step 2: Run test to verify it fails**

Run: `npm run test -- packages/compiler/src/tests/grammar/semicolon.spec.ts`
Expected: FAIL on statement kinds still using direct semicolon consume.

**Step 3: Write minimal implementation**

In each file above, replace direct statement semicolon `iterator.consume(TOKENS.SYMBOLS.semicolon)` with `consumeStmtTerminator(iterator)`.

In `stmt.ts`, update all variants that currently enforce statement terminator directly.

Do not touch `forStmt.ts` semicolon separators.

**Step 4: Run test to verify it passes**

Run: `npm run test -- packages/compiler/src/tests/grammar/semicolon.spec.ts`
Expected: statement omission tests pass in optional mode.

**Step 5: Commit**

```bash
git add packages/compiler/src/grammar/syntax/declarationStmt.ts packages/compiler/src/grammar/syntax/ioStmt.ts packages/compiler/src/grammar/syntax/returnStmt.ts packages/compiler/src/grammar/syntax/breakStmt.ts packages/compiler/src/grammar/syntax/continueStmt.ts packages/compiler/src/grammar/syntax/stmt.ts
git commit -m "feat(grammar): apply optional semicolon helper to statements"
```

### Task 4: Preserve `for` grammar semicolon requirements

**Files:**
- Modify: `packages/compiler/src/tests/grammar/semicolon.spec.ts`
- Verify (no logic change expected): `packages/compiler/src/grammar/syntax/forStmt.ts`

**Step 1: Write the failing test**

Add tests:
- `for(;;)` is valid.
- `for(;;;){}` (or equivalent source) fails.
- Missing internal separators in `for` fails in both modes.

**Step 2: Run test to verify it fails**

Run: `npm run test -- packages/compiler/src/tests/grammar/semicolon.spec.ts`
Expected: FAIL until all edge cases are represented correctly and parser behavior validated.

**Step 3: Write minimal implementation**

If needed, only adjust tests or tiny parser guard logic. Keep `forStmt` separator consumption explicit with direct `consume(semicolon)`.

**Step 4: Run test to verify it passes**

Run: `npm run test -- packages/compiler/src/tests/grammar/semicolon.spec.ts`
Expected: `for` behavior tests pass, including `for(;;)` valid and `for(;;;)` invalid.

**Step 5: Commit**

```bash
git add packages/compiler/src/tests/grammar/semicolon.spec.ts
git commit -m "test(grammar): cover for-loop semicolon edge cases"
```

### Task 5: Add strict mode coverage and finalize verification

**Files:**
- Modify: `packages/compiler/src/tests/grammar/semicolon.spec.ts`
- Modify (if needed): `packages/compiler/src/tests/grammar/helpers.ts`

**Step 1: Write the failing test**

Add strict mode suite with helper option:
- Missing statement `;` in strict mode must fail even at EOL.
- Same sources in optional mode must pass.

**Step 2: Run test to verify it fails**

Run: `npm run test -- packages/compiler/src/tests/grammar/semicolon.spec.ts`
Expected: FAIL before strict behavior is fully wired.

**Step 3: Write minimal implementation**

Ensure strict mode path in `consumeStmtTerminator` and iterator config is used by tests and parser entry points.

**Step 4: Run test to verify it passes**

Run:
- `npm run test -- packages/compiler/src/tests/grammar/semicolon.spec.ts`
- `npm run test -- packages/compiler/src/tests/grammar`

Expected: PASS for new semicolon suites and existing grammar suites.

**Step 5: Commit**

```bash
git add packages/compiler/src/tests/grammar/semicolon.spec.ts packages/compiler/src/tests/grammar/helpers.ts
git commit -m "test(grammar): add strict semicolon mode coverage"
```

### Task 6: Full verification before merge handoff

**Files:**
- No source changes required unless regressions appear.

**Step 1: Run full compiler test suite**

Run: `cd packages/compiler && npm test`
Expected: PASS all tests.

**Step 2: Run root checks that could be affected**

Run: `npm test`
Expected: PASS or unchanged baseline.

**Step 3: If failures occur, fix minimally with TDD loop**

- Add/adjust failing test.
- Apply minimal fix.
- Re-run affected tests.

**Step 4: Final commit (if fixes were needed)**

```bash
git add <changed-files>
git commit -m "fix(grammar): resolve semicolon mode regression"
```
