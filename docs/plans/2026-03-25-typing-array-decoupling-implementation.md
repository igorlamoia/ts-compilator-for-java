# Typing and Array Mode Decoupling Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Decouple `typingMode` from `arrayMode`, require explicit types only for new variable declarations in typed mode, and support fixed or dynamic untyped arrays based solely on `arrayMode`.

**Architecture:** Keep the existing compiler pipeline and IDE configuration flow. Make the change in three vertical slices: compiler grammar/tests, IDE normalization/state, and editor/customizer UX coverage. Preserve the current assignment path so `x = 1;` remains valid in typed mode when `x` already resolves in scope, while arrays in untyped mode gain fixed or dynamic declaration forms according to `arrayMode`.

**Tech Stack:** TypeScript, Vitest, existing compiler grammar/parser modules, React/Next.js IDE configuration state.

---

### Task 1: Add compiler regression tests for typed declarations and fixed/dynamic untyped arrays

**Files:**
- Modify: `packages/compiler/src/tests/grammar/typing-mode.spec.ts`
- Check: `packages/compiler/src/grammar/syntax/declarationStmt.ts`
- Check: `packages/compiler/src/grammar/syntax/stmt.ts`

**Step 1: Write the failing tests**

Add tests covering:

```ts
it("rejects implicit declaration in typed mode when identifier is undeclared", () => {
  expect(() =>
    parseProgram("main(){ x = 1; }", {
      grammar: { typingMode: "typed", arrayMode: "fixed" },
    }),
  ).toThrow();
});

it("accepts assignment in typed mode when identifier was declared earlier", () => {
  expect(() =>
    parseProgram("main(){ int x; x = 1; }", {
      grammar: { typingMode: "typed", arrayMode: "fixed" },
    }),
  ).not.toThrow();
});

it("accepts fixed untyped array declaration with empty initializer", () => {
  expect(() =>
    parseProgram("main(){ lista[10] = []; }", {
      grammar: { typingMode: "untyped", arrayMode: "fixed" },
    }),
  ).not.toThrow();
});

it("rejects dynamic untyped array syntax in fixed array mode", () => {
  expect(() =>
    parseProgram("main(){ lista[] = []; }", {
      grammar: { typingMode: "untyped", arrayMode: "fixed" },
    }),
  ).toThrow();
});
```

**Step 2: Run test to verify it fails**

Run: `npm run test --workspace=@ts-compilator-for-java/compiler -- src/tests/grammar/typing-mode.spec.ts`
Expected: FAIL because untyped fixed arrays are still coupled to dynamic syntax or missing coverage.

**Step 3: Commit**

```bash
git add packages/compiler/src/tests/grammar/typing-mode.spec.ts
git commit -m "test(compiler): cover typing and array mode decoupling"
```

### Task 2: Make untyped array declaration syntax follow `arrayMode`

**Files:**
- Modify: `packages/compiler/src/grammar/syntax/stmt.ts`
- Modify: `packages/compiler/src/grammar/syntax/declarationStmt.ts`
- Check: `packages/compiler/src/token/TokenIterator.ts`
- Test: `packages/compiler/src/tests/grammar/typing-mode.spec.ts`

**Step 1: Write the failing test**

If Task 1 did not already isolate the failure clearly enough, add one narrow test:

```ts
it("accepts lista[10] = [] in untyped fixed mode", () => {
  expect(() =>
    parseProgram("main(){ lista[10] = []; }", {
      grammar: { typingMode: "untyped", arrayMode: "fixed" },
    }),
  ).not.toThrow();
});
```

**Step 2: Run test to verify it fails**

Run: `npm run test --workspace=@ts-compilator-for-java/compiler -- src/tests/grammar/typing-mode.spec.ts -t "untyped fixed mode"`
Expected: FAIL because `stmt.ts` currently routes untyped array declarations only when `arrayMode === "dynamic"` and `declarationStmt.ts` only has the dynamic helper for the identifier-led declaration form.

**Step 3: Write minimal implementation**

Implement the smallest parser changes that make identifier-led untyped array declarations depend on `arrayMode`:

```ts
if (typingMode === "untyped" && iterator.match(TOKENS.SYMBOLS.left_bracket)) {
  const canDeclareArray =
    arrayMode === "dynamic"
      ? iterator.peekAt(1)?.type === TOKENS.SYMBOLS.right_bracket
      : iterator.peekAt(1)?.type === TOKENS.LITERALS.integer_literal;

  if (canDeclareArray && looksLikeUntypedArrayDeclaration(iterator)) {
    declareUntypedArray(iterator, identifier);
    return;
  }
}
```

And generalize the helper in `declarationStmt.ts` so it reads either:

```ts
lista[] = [];
lista[10] = [];
```

depending on `iterator.getArrayMode()`.

**Step 4: Run test to verify it passes**

Run: `npm run test --workspace=@ts-compilator-for-java/compiler -- src/tests/grammar/typing-mode.spec.ts`
Expected: PASS for the new untyped fixed/dynamic array declaration cases.

**Step 5: Commit**

```bash
git add packages/compiler/src/grammar/syntax/stmt.ts \
  packages/compiler/src/grammar/syntax/declarationStmt.ts \
  packages/compiler/src/tests/grammar/typing-mode.spec.ts
git commit -m "feat(compiler): decouple untyped array syntax from typing mode"
```

### Task 3: Verify typed mode still distinguishes declaration from assignment

**Files:**
- Modify: `packages/compiler/src/tests/grammar/typing-mode.spec.ts`
- Check: `packages/compiler/src/grammar/syntax/stmt.ts`
- Check: `packages/compiler/src/grammar/syntax/attributeStmt.ts`

**Step 1: Write the failing test**

Add or refine a test that proves typed mode allows assignment only after declaration:

```ts
it("accepts typed assignment after declaration and rejects undeclared assignment", () => {
  expect(() =>
    parseProgram("main(){ int x; x = 1; }", {
      grammar: { typingMode: "typed", arrayMode: "fixed" },
    }),
  ).not.toThrow();

  expect(() =>
    parseProgram("main(){ y = 1; }", {
      grammar: { typingMode: "typed", arrayMode: "fixed" },
    }),
  ).toThrow();
});
```

**Step 2: Run test to verify current behavior**

Run: `npm run test --workspace=@ts-compilator-for-java/compiler -- src/tests/grammar/typing-mode.spec.ts -t "typed assignment"`
Expected: PASS or FAIL depending on current regression coverage. If it already passes, keep the test as a guard and do not change compiler logic unnecessarily.

**Step 3: Write minimal implementation only if needed**

If the test fails, keep identifier-led typed statements on the assignment path and fix only the scope/symbol resolution issue:

```ts
const target = parseAssignmentTarget(iterator, identifier);
iterator.consume(TOKENS.ASSIGNMENTS.equal, "=");
emitAssignment(iterator, target);
```

Do not add implicit variable creation in typed mode.

**Step 4: Run test to verify it passes**

Run: `npm run test --workspace=@ts-compilator-for-java/compiler -- src/tests/grammar/typing-mode.spec.ts`
Expected: PASS for typed declaration-vs-assignment behavior.

**Step 5: Commit**

```bash
git add packages/compiler/src/tests/grammar/typing-mode.spec.ts \
  packages/compiler/src/grammar/syntax/stmt.ts \
  packages/compiler/src/grammar/syntax/attributeStmt.ts
git commit -m "test(compiler): lock typed declaration semantics"
```

### Task 4: Remove frontend normalization that couples `untyped` to dynamic arrays

**Files:**
- Modify: `packages/ide/src/lib/compiler-config.ts`
- Modify: `packages/ide/src/lib/compiler-config.spec.ts`
- Check: `packages/ide/src/entities/compiler-config.ts`

**Step 1: Write the failing test**

Add a test like:

```ts
it("preserves fixed array mode in untyped grammar", () => {
  const normalized = normalizeCompilerConfig({
    grammar: { typingMode: "untyped", arrayMode: "fixed" },
  });

  expect(normalized.grammar.typingMode).toBe("untyped");
  expect(normalized.grammar.arrayMode).toBe("fixed");
});
```

**Step 2: Run test to verify it fails**

Run: `npm run test --workspace=@ts-compilator-for-java/ide -- src/lib/compiler-config.spec.ts`
Expected: FAIL because normalization currently coerces untyped mode to dynamic arrays.

**Step 3: Write minimal implementation**

Replace the coercion logic with direct validation/defaulting:

```ts
const arrayMode =
  requestedArrayMode === "fixed" || requestedArrayMode === "dynamic"
    ? requestedArrayMode
    : DEFAULT_GRAMMAR.arrayMode;
```

**Step 4: Run test to verify it passes**

Run: `npm run test --workspace=@ts-compilator-for-java/ide -- src/lib/compiler-config.spec.ts`
Expected: PASS

**Step 5: Commit**

```bash
git add packages/ide/src/lib/compiler-config.ts \
  packages/ide/src/lib/compiler-config.spec.ts
git commit -m "fix(ide): preserve array mode independently of typing"
```

### Task 5: Remove UI/state coercion and keep saved customization independent

**Files:**
- Modify: `packages/ide/src/contexts/KeywordContext.tsx`
- Modify: `packages/ide/src/components/keyword-customizer.tsx`
- Check: `packages/ide/src/entities/compiler-config.ts`
- Test: `packages/ide/src/lib/compiler-config.spec.ts`

**Step 1: Write the failing test**

If there is existing coverage for the customization state or component behavior, add/update it. Otherwise add a narrow regression around the context normalization logic:

```ts
expect(loadCustomization({
  typingMode: "untyped",
  arrayMode: "fixed",
}).arrayMode).toBe("fixed");
```

If component tests are easier, add a UI regression proving the array-mode control is still enabled in untyped mode.

**Step 2: Run test to verify it fails**

Run: `npm run test --workspace=@ts-compilator-for-java/ide -- src/contexts/KeywordContext.spec.tsx`
Expected: FAIL because the current context/customizer logic normalizes untyped selections back to `dynamic` or disables the control.

**Step 3: Write minimal implementation**

Remove code paths like:

```ts
if (typingMode === "untyped" && arrayMode !== "dynamic") {
  setArrayMode("dynamic");
}
```

and any UI disabling such as:

```tsx
disabled={draftTypingMode === "untyped"}
```

Preserve both fields independently in draft and persisted state.

**Step 4: Run test to verify it passes**

Run: `npm run test --workspace=@ts-compilator-for-java/ide -- src/contexts/KeywordContext.spec.tsx`
Expected: PASS

**Step 5: Commit**

```bash
git add packages/ide/src/contexts/KeywordContext.tsx \
  packages/ide/src/components/keyword-customizer.tsx \
  packages/ide/src/contexts/KeywordContext.spec.tsx
git commit -m "feat(ide): decouple typing and array mode controls"
```

### Task 6: Update editor snippets for the new mode matrix

**Files:**
- Modify: `packages/ide/src/utils/compiler/editor/keyword-snippets.ts`
- Modify: `packages/ide/src/utils/compiler/editor/editor-language.spec.ts`
- Check: `packages/ide/src/utils/compiler/editor/editor-language.ts`

**Step 1: Write the failing test**

Add tests ensuring snippets exist for both untyped fixed and untyped dynamic array declarations:

```ts
it("shows fixed untyped array snippets in untyped fixed mode", () => {
  const labels = getSnippetLabels({
    typingMode: "untyped",
    arrayMode: "fixed",
  });

  expect(labels).toEqual(expect.arrayContaining(["lista[10] = [];"]));
  expect(labels).not.toEqual(expect.arrayContaining(["lista[] = [];"]));
});
```

**Step 2: Run test to verify it fails**

Run: `npm run test --workspace=@ts-compilator-for-java/ide -- src/utils/compiler/editor/editor-language.spec.ts`
Expected: FAIL because current snippet data and filtering assume untyped mode only exposes dynamic arrays.

**Step 3: Write minimal implementation**

Add the missing snippet metadata:

```ts
{
  label: "lista[10] = [];",
  typingMode: "untyped",
  arrayMode: "fixed",
}
```

and keep filtering based on independent `typingMode` and `arrayMode` checks.

**Step 4: Run test to verify it passes**

Run: `npm run test --workspace=@ts-compilator-for-java/ide -- src/utils/compiler/editor/editor-language.spec.ts`
Expected: PASS

**Step 5: Commit**

```bash
git add packages/ide/src/utils/compiler/editor/keyword-snippets.ts \
  packages/ide/src/utils/compiler/editor/editor-language.spec.ts
git commit -m "feat(ide): add fixed-array snippets for untyped mode"
```

### Task 7: Run focused verification across compiler and IDE

**Files:**
- Check: `packages/compiler/src/tests/grammar/typing-mode.spec.ts`
- Check: `packages/ide/src/lib/compiler-config.spec.ts`
- Check: `packages/ide/src/utils/compiler/editor/editor-language.spec.ts`
- Check: `packages/ide/src/contexts/KeywordContext.spec.tsx`

**Step 1: Run compiler verification**

Run: `npm run test --workspace=@ts-compilator-for-java/compiler -- src/tests/grammar/typing-mode.spec.ts`
Expected: PASS

**Step 2: Run IDE config verification**

Run: `npm run test --workspace=@ts-compilator-for-java/ide -- src/lib/compiler-config.spec.ts`
Expected: PASS

**Step 3: Run IDE editor/context verification**

Run: `npm run test --workspace=@ts-compilator-for-java/ide -- src/utils/compiler/editor/editor-language.spec.ts src/contexts/KeywordContext.spec.tsx`
Expected: PASS

**Step 4: Commit**

```bash
git add packages/compiler/src/tests/grammar/typing-mode.spec.ts \
  packages/ide/src/lib/compiler-config.spec.ts \
  packages/ide/src/utils/compiler/editor/editor-language.spec.ts \
  packages/ide/src/contexts/KeywordContext.spec.tsx
git commit -m "test: verify typing and array mode decoupling"
```
