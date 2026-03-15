# Bool Support Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Add first-class `bool` support with `true` and `false` literals across lexing, parsing, semantic typing, and runtime execution.

**Architecture:** Extend the existing token and type pipeline rather than adding a separate boolean subsystem. Implement the change with TDD in small steps so each stage proves `bool` support before the next layer depends on it.

**Tech Stack:** TypeScript, Vitest, existing lexer/grammar/interpreter pipeline

---

### Task 1: Add lexer coverage for boolean keywords and literals

**Files:**
- Modify: `src/tests/lexer/number.spec.ts`
- Modify: `src/tests/tokens/index.spec.ts`
- Modify: `src/token/constants/reserveds.ts`
- Modify: `src/lexer/config.ts`

**Step 1: Write the failing test**

Add lexer assertions for a source like:

```ts
const source = `bool flag = true; bool other = false;`;
```

Assert that `bool`, `true`, and `false` are tokenized with the reserved token ids rather than identifiers.

**Step 2: Run test to verify it fails**

Run: `npm test -- src/tests/lexer/number.spec.ts src/tests/tokens/index.spec.ts`
Expected: FAIL because `bool`, `true`, or `false` are not recognized as reserved tokens.

**Step 3: Write minimal implementation**

- Add reserved token ids for `bool`, `true`, and `false`.
- Register them in the lexer keyword map.
- Update token index coverage if needed.

**Step 4: Run test to verify it passes**

Run: `npm test -- src/tests/lexer/number.spec.ts src/tests/tokens/index.spec.ts`
Expected: PASS

**Step 5: Commit**

```bash
git add src/tests/lexer/number.spec.ts src/tests/tokens/index.spec.ts src/token/constants/reserveds.ts src/lexer/config.ts
git commit -m "feat: add boolean lexer tokens"
```

### Task 2: Add parser and semantic tests for `bool` declarations and function signatures

**Files:**
- Modify: `src/tests/grammar/type-semantics.spec.ts`
- Modify: `src/grammar/syntax/typeStmt.ts`
- Modify: `src/token/TokenIterator.ts`
- Modify: `src/grammar/syntax/declarationStmt.ts`
- Modify: related grammar files that parse parameters and function signatures if required

**Step 1: Write the failing test**

Add tests for:

```ts
bool isReady(bool value) {
  return value;
}

int main() {
  bool flag = true;
  return 0;
}
```

Assert compile succeeds with no type error and that boolean literals infer type `bool`.

**Step 2: Run test to verify it fails**

Run: `npm test -- src/tests/grammar/type-semantics.spec.ts`
Expected: FAIL because `bool` is not accepted by type parsing or semantic handling.

**Step 3: Write minimal implementation**

- Allow `bool` in `typeStmt`.
- Ensure `ValueType` and literal inference treat boolean literals as `bool`.
- Update any type-merging or semantic helpers that need to preserve `bool`.

**Step 4: Run test to verify it passes**

Run: `npm test -- src/tests/grammar/type-semantics.spec.ts`
Expected: PASS

**Step 5: Commit**

```bash
git add src/tests/grammar/type-semantics.spec.ts src/grammar/syntax/typeStmt.ts src/token/TokenIterator.ts
git commit -m "feat: add boolean semantic typing"
```

### Task 3: Add runtime tests for boolean values and function flow

**Files:**
- Modify: `src/tests/grammar/type-semantics.spec.ts`
- Modify: `src/interpreter/index.ts`
- Modify: `src/interpreter/utils.ts`
- Modify: `src/interpreter/constants.ts`

**Step 1: Write the failing test**

Add runtime tests for:

```ts
int main() {
  bool flag = true;
  print(flag);
  return 0;
}
```

and:

```ts
bool negate(bool value) {
  return !value;
}

int main() {
  print(negate(false));
  return 0;
}
```

Assert output is `true` and `true` respectively.

**Step 2: Run test to verify it fails**

Run: `npm test -- src/tests/grammar/type-semantics.spec.ts`
Expected: FAIL because runtime coercion or parsing does not yet preserve `bool` consistently.

**Step 3: Write minimal implementation**

- Update runtime coercion helpers to handle `bool`.
- Ensure boolean declarations, assignments, and returns remain booleans at execution time.

**Step 4: Run test to verify it passes**

Run: `npm test -- src/tests/grammar/type-semantics.spec.ts`
Expected: PASS

**Step 5: Commit**

```bash
git add src/tests/grammar/type-semantics.spec.ts src/interpreter/index.ts src/interpreter/utils.ts src/interpreter/constants.ts
git commit -m "feat: execute boolean values at runtime"
```

### Task 4: Run focused regression tests

**Files:**
- Test: `src/tests/lexer/number.spec.ts`
- Test: `src/tests/tokens/index.spec.ts`
- Test: `src/tests/grammar/type-semantics.spec.ts`
- Test: other focused grammar tests if boolean token changes affect them

**Step 1: Run focused test suite**

Run: `npm test -- src/tests/lexer/number.spec.ts src/tests/tokens/index.spec.ts src/tests/grammar/type-semantics.spec.ts`
Expected: PASS

**Step 2: Fix any regressions**

Apply minimal code changes only if a failing test demonstrates a real regression.

**Step 3: Re-run focused test suite**

Run: `npm test -- src/tests/lexer/number.spec.ts src/tests/tokens/index.spec.ts src/tests/grammar/type-semantics.spec.ts`
Expected: PASS

**Step 4: Commit**

```bash
git add .
git commit -m "test: verify boolean support regressions"
```
