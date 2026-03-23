# Array Literal Initialization Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Add declaration-time array and matrix literal population with bracket syntax and mandatory commas, while keeping array literals invalid outside declarations.

**Architecture:** Extend declaration parsing with a recursive array-literal parser that is only reachable from array declarations. Validate literal depth, fixed-size shape, and typed element compatibility before lowering initialization into existing `DECLARE_ARRAY` plus `ARRAY_SET` IR so the current interpreter array runtime remains the single execution path.

**Tech Stack:** TypeScript, Vitest, existing compiler grammar/IR/interpreter pipeline in `packages/compiler/src`

---

### Task 1: Add failing grammar tests for declaration-time array literals

**Files:**
- Modify: `packages/compiler/src/tests/grammar/type-semantics.spec.ts`
- Test: `packages/compiler/src/tests/grammar/type-semantics.spec.ts`

**Step 1: Write the failing test**

Add grammar/runtime coverage for:

- `int vetor[2] = [0, 1];`
- `int matriz[2][2] = [[0, 1], [2, 3]];`
- `vetor[] = [0, 1];` in `{ typingMode: "untyped", arrayMode: "dynamic" }`
- rejection of `vetor = [0, 1];`
- rejection of `int matriz[2][2] = [[0, 1] [2, 3]];`

**Step 2: Run test to verify it fails**

Run: `npm test -- packages/compiler/src/tests/grammar/type-semantics.spec.ts`
Expected: FAIL because declaration parsing does not currently accept populated array literals.

**Step 3: Write minimal implementation**

Do not implement behavior yet. Only keep the new failing tests in place.

**Step 4: Run test to verify it still fails for the expected reason**

Run: `npm test -- packages/compiler/src/tests/grammar/type-semantics.spec.ts`
Expected: FAIL with parse errors around `=` or `[` in initialized array declarations.

**Step 5: Commit**

```bash
git add packages/compiler/src/tests/grammar/type-semantics.spec.ts
git commit -m "test: cover declaration-time array literal initialization"
```

### Task 2: Parse bracketed array literals only from declaration contexts

**Files:**
- Modify: `packages/compiler/src/grammar/syntax/declarationStmt.ts`
- Modify: `packages/compiler/src/grammar/syntax/stmt.ts`
- Modify: `packages/compiler/src/tests/grammar/type-semantics.spec.ts`
- Test: `packages/compiler/src/tests/grammar/type-semantics.spec.ts`

**Step 1: Write the failing test**

Add or refine focused tests that prove:

- array literals are accepted only immediately after array declarations
- plain assignments like `vetor = [0, 1];` remain invalid

**Step 2: Run test to verify it fails**

Run: `npm test -- packages/compiler/src/tests/grammar/type-semantics.spec.ts`
Expected: FAIL because there is no declaration-scoped array literal parser.

**Step 3: Write minimal implementation**

- In `declarationStmt.ts`, after parsing an array declaration and consuming `=`, call a new recursive helper that parses:
  - `[` to start a literal
  - comma-separated scalar-or-nested elements
  - `]` to end the literal
- Keep the helper private to declaration parsing so general expression parsing is unchanged.
- In `stmt.ts`, preserve current assignment behavior so array literals are not introduced as normal expressions.

**Step 4: Run test to verify it passes**

Run: `npm test -- packages/compiler/src/tests/grammar/type-semantics.spec.ts`
Expected: PASS for declaration-only parsing cases, with later semantic validation still possibly failing on size/type mismatches.

**Step 5: Commit**

```bash
git add packages/compiler/src/grammar/syntax/declarationStmt.ts packages/compiler/src/grammar/syntax/stmt.ts packages/compiler/src/tests/grammar/type-semantics.spec.ts
git commit -m "feat: parse array literals in declaration context"
```

### Task 3: Validate literal depth, commas, and fixed-size shape

**Files:**
- Modify: `packages/compiler/src/grammar/syntax/declarationStmt.ts`
- Modify: `packages/compiler/src/token/TokenIterator.ts`
- Modify: `packages/compiler/src/tests/grammar/type-semantics.spec.ts`
- Test: `packages/compiler/src/tests/grammar/type-semantics.spec.ts`

**Step 1: Write the failing test**

Add tests for:

- wrong depth: `int matriz[2][2] = [0, 1];`
- wrong size: `int vetor[2] = [0, 1, 2];`
- malformed separators: `int matriz[2][2] = [[0, 1] [2, 3]];`
- inconsistent nested shapes, if rows have different lengths

**Step 2: Run test to verify it fails**

Run: `npm test -- packages/compiler/src/tests/grammar/type-semantics.spec.ts`
Expected: FAIL because parsing alone does not validate the declared shape against the literal.

**Step 3: Write minimal implementation**

- Add a validation pass over the parsed literal tree.
- Compute literal depth and sibling lengths recursively.
- Compare depth against declared dimensions.
- In fixed array mode, compare each literal dimension length against declared sizes.
- Ensure commas are enforced by the parser rather than silently accepting adjacent nested literals.

**Step 4: Run test to verify it passes**

Run: `npm test -- packages/compiler/src/tests/grammar/type-semantics.spec.ts`
Expected: PASS for shape validation and malformed separator rejection.

**Step 5: Commit**

```bash
git add packages/compiler/src/grammar/syntax/declarationStmt.ts packages/compiler/src/token/TokenIterator.ts packages/compiler/src/tests/grammar/type-semantics.spec.ts
git commit -m "feat: validate array literal shape in declarations"
```

### Task 4: Enforce typed element compatibility for initialized arrays

**Files:**
- Modify: `packages/compiler/src/grammar/syntax/declarationStmt.ts`
- Modify: `packages/compiler/src/token/TokenIterator.ts`
- Modify: `packages/compiler/src/tests/grammar/type-semantics.spec.ts`
- Test: `packages/compiler/src/tests/grammar/type-semantics.spec.ts`

**Step 1: Write the failing test**

Add tests for:

- `int vetor[2] = [0, 1];` accepted
- `int vetor[2] = [0, "x"];` rejected
- bool and string typed arrays initialized with compatible values

**Step 2: Run test to verify it fails**

Run: `npm test -- packages/compiler/src/tests/grammar/type-semantics.spec.ts`
Expected: FAIL because literal leaves are not yet checked against typed array element rules.

**Step 3: Write minimal implementation**

- Reuse existing scalar assignment/type-compatibility rules for each literal leaf.
- Validate nested literal leaves against the declared base type before IR emission.
- Preserve current untyped mode behavior so only depth/shape constraints apply there.

**Step 4: Run test to verify it passes**

Run: `npm test -- packages/compiler/src/tests/grammar/type-semantics.spec.ts`
Expected: PASS for typed array initialization compatibility cases.

**Step 5: Commit**

```bash
git add packages/compiler/src/grammar/syntax/declarationStmt.ts packages/compiler/src/token/TokenIterator.ts packages/compiler/src/tests/grammar/type-semantics.spec.ts
git commit -m "feat: validate typed array literal elements"
```

### Task 5: Lower array literal initialization into existing array IR

**Files:**
- Modify: `packages/compiler/src/grammar/syntax/declarationStmt.ts`
- Modify: `packages/compiler/src/ir/emitter.ts`
- Modify: `packages/compiler/src/tests/grammar/type-semantics.spec.ts`
- Test: `packages/compiler/src/tests/grammar/type-semantics.spec.ts`

**Step 1: Write the failing test**

Add assertions that initialized array declarations emit:

- `DECLARE_ARRAY`
- one `ARRAY_SET` per populated leaf element

**Step 2: Run test to verify it fails**

Run: `npm test -- packages/compiler/src/tests/grammar/type-semantics.spec.ts`
Expected: FAIL because initialized declarations are not yet lowered into the current array instruction set.

**Step 3: Write minimal implementation**

- Flatten the validated literal into indexed leaf entries such as:
  - `[0] -> 0`
  - `[1] -> 1`
  - `[0, 0] -> 0`
  - `[0, 1] -> 1`
- Emit the existing array declaration instruction first.
- Emit one `ARRAY_SET` instruction for each flattened literal value.

**Step 4: Run test to verify it passes**

Run: `npm test -- packages/compiler/src/tests/grammar/type-semantics.spec.ts`
Expected: PASS with IR matching declaration-plus-writes lowering.

**Step 5: Commit**

```bash
git add packages/compiler/src/grammar/syntax/declarationStmt.ts packages/compiler/src/ir/emitter.ts packages/compiler/src/tests/grammar/type-semantics.spec.ts
git commit -m "feat: lower array literals into array ir writes"
```

### Task 6: Verify runtime behavior for initialized vectors and matrices

**Files:**
- Modify: `packages/compiler/src/tests/grammar/type-semantics.spec.ts`
- Test: `packages/compiler/src/tests/grammar/type-semantics.spec.ts`

**Step 1: Write the failing test**

Add runtime cases that read initialized values immediately after declaration:

- `int vetor[2] = [0, 1]; print(vetor[0]); print(vetor[1]);`
- `int matriz[2][2] = [[0, 1], [2, 3]]; print(matriz[1][0]); print(matriz[1][1]);`
- untyped dynamic initialization followed by indexed reads

**Step 2: Run test to verify it fails**

Run: `npm test -- packages/compiler/src/tests/grammar/type-semantics.spec.ts`
Expected: FAIL if IR lowering or runtime integration is incomplete.

**Step 3: Write minimal implementation**

- Adjust only what is necessary so the existing interpreter executes the emitted `ARRAY_SET` initialization sequence during declaration-time setup.
- Avoid introducing a second runtime path for initialized arrays.

**Step 4: Run test to verify it passes**

Run: `npm test -- packages/compiler/src/tests/grammar/type-semantics.spec.ts`
Expected: PASS with initialized values readable at the expected indexes.

**Step 5: Commit**

```bash
git add packages/compiler/src/tests/grammar/type-semantics.spec.ts
git commit -m "test: verify runtime behavior for initialized arrays"
```

### Task 7: Run focused regression coverage for existing array behavior

**Files:**
- Test: `packages/compiler/src/tests/grammar/type-semantics.spec.ts`
- Test: `packages/compiler/src/tests/grammar/typing-mode.spec.ts`

**Step 1: Write the failing test**

No new tests in this step. Use existing coverage to catch regressions in declaration, typed/untyped, and array mode behavior.

**Step 2: Run test to verify current state**

Run: `npm test -- packages/compiler/src/tests/grammar/type-semantics.spec.ts packages/compiler/src/tests/grammar/typing-mode.spec.ts`
Expected: PASS

**Step 3: Write minimal implementation**

No code changes unless the regression suite exposes a real issue. If it does, make the smallest fix in the already touched grammar files and extend tests only for the regression.

**Step 4: Run test to verify it passes**

Run: `npm test -- packages/compiler/src/tests/grammar/type-semantics.spec.ts packages/compiler/src/tests/grammar/typing-mode.spec.ts`
Expected: PASS

**Step 5: Commit**

```bash
git add packages/compiler/src/grammar/syntax/declarationStmt.ts packages/compiler/src/grammar/syntax/stmt.ts packages/compiler/src/token/TokenIterator.ts packages/compiler/src/ir/emitter.ts packages/compiler/src/tests/grammar/type-semantics.spec.ts packages/compiler/src/tests/grammar/typing-mode.spec.ts
git commit -m "test: cover array literal initialization regressions"
```
