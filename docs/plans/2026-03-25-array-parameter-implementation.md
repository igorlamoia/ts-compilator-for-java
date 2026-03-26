# Array Parameter Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Add by-reference array and matrix parameters to typed function signatures, with exact-size validation in fixed mode and dimension-count validation in dynamic mode.

**Architecture:** Extend the compiler's function-signature model from scalar-only parameter types to full parameter descriptors that can represent arrays. Update parameter parsing, function-call validation, and interpreter parameter binding so array runtime values are forwarded by reference into callee scopes without copying.

**Tech Stack:** TypeScript, Vitest, compiler grammar/parser modules, interpreter runtime, existing symbol and array descriptor model.

---

### Task 1: Add parser and runtime regression tests for array parameters

**Files:**
- Modify: `packages/compiler/src/tests/grammar/typing-mode.spec.ts`
- Modify: `packages/compiler/src/tests/grammar/type-semantics.spec.ts`
- Check: `packages/compiler/src/tests/grammar/helpers.ts`

**Step 1: Write the failing tests**

Add tests covering:

```ts
it("accepts fixed matrix parameters with exact sizes", () => {
  const source = `
    void printa(int vec[2][4]) { print(vec[0][0]); }
    int main() { int vec[2][4]; printa(vec); return 0; }
  `;

  expect(() =>
    compileToIr(source, { grammar: { typingMode: "typed", arrayMode: "fixed" } }),
  ).not.toThrow();
});

it("rejects fixed matrix parameters with mismatched sizes", () => {
  const source = `
    void printa(int vec[3][4]) { }
    int main() { int vec[2][4]; printa(vec); return 0; }
  `;

  expect(() =>
    compileToIr(source, { grammar: { typingMode: "typed", arrayMode: "fixed" } }),
  ).toThrow();
});

it("passes dynamic matrix parameters when dimensions match", () => {
  const source = `
    void printa(int vec[][]) { print(vec[0][0]); }
    int main() { int vec[][] = [[1, 2], [3, 4]]; printa(vec); return 0; }
  `;

  expect(() =>
    compileToIr(source, { grammar: { typingMode: "typed", arrayMode: "dynamic" } }),
  ).not.toThrow();
});
```

Add a runtime test proving reference semantics:

```ts
it("propagates array writes through parameter references", async () => {
  const source = `
    void altera(int vec[2][2]) {
      vec[0][0] = 99;
    }

    int main() {
      int vec[2][2] = [[1, 2], [3, 4]];
      altera(vec);
      print(vec[0][0]);
      return 0;
    }
  `;

  await expect(runProgram(source, { grammar: { typingMode: "typed", arrayMode: "fixed" } }))
    .resolves.toContain("99");
});
```

**Step 2: Run test to verify it fails**

Run: `npm run test --workspace=@ts-compilator-for-java/compiler -- src/tests/grammar/typing-mode.spec.ts src/tests/grammar/type-semantics.spec.ts`
Expected: FAIL because parameter parsing and function signatures currently only support scalar parameter types.

**Step 3: Commit**

```bash
git add packages/compiler/src/tests/grammar/typing-mode.spec.ts \
  packages/compiler/src/tests/grammar/type-semantics.spec.ts
git commit -m "test(compiler): cover array parameters by reference"
```

### Task 2: Extend function signature types to describe array parameters

**Files:**
- Modify: `packages/compiler/src/token/TokenIterator.ts`
- Check: `packages/compiler/src/grammar/syntax/parameterListStmt.ts`
- Check: `packages/compiler/src/grammar/syntax/function-call.ts`

**Step 1: Write the failing test**

Keep one narrow test from Task 1 focused on function declaration acceptance:

```ts
it("accepts fixed array parameter descriptors in signatures", () => {
  expect(() =>
    compileToIr(`void f(int vec[2][4]) { } int main() { int vec[2][4]; f(vec); return 0; }`, {
      grammar: { typingMode: "typed", arrayMode: "fixed" },
    }),
  ).not.toThrow();
});
```

**Step 2: Run test to verify it fails**

Run: `npm run test --workspace=@ts-compilator-for-java/compiler -- src/tests/grammar/typing-mode.spec.ts -t "array parameter descriptors"`
Expected: FAIL because `FunctionSignature.params` stores only `ValueType[]`.

**Step 3: Write minimal implementation**

Refactor the function signature model to store parameter descriptors:

```ts
type ParameterDescriptor =
  | { kind: "scalar"; type: ValueType }
  | {
      kind: "array";
      baseType: ScalarType;
      dimensions: number;
      arrayMode: "fixed" | "dynamic";
      sizes: number[];
    };

type FunctionSignature = {
  returnType: ValueType;
  params: ParameterDescriptor[];
};
```

Add `declareFunction` and `resolveFunction` support for this richer structure without changing unrelated symbol APIs.

**Step 4: Run test to verify it passes**

Run: `npm run test --workspace=@ts-compilator-for-java/compiler -- src/tests/grammar/typing-mode.spec.ts -t "array parameter descriptors"`
Expected: PASS for signature storage and lookup once parser support lands.

**Step 5: Commit**

```bash
git add packages/compiler/src/token/TokenIterator.ts
git commit -m "refactor(compiler): model array parameter descriptors"
```

### Task 3: Parse fixed and dynamic array parameters in function signatures

**Files:**
- Modify: `packages/compiler/src/grammar/syntax/parameterListStmt.ts`
- Modify: `packages/compiler/src/grammar/syntax/function-call.ts`
- Check: `packages/compiler/src/grammar/syntax/typeStmt.ts`
- Test: `packages/compiler/src/tests/grammar/typing-mode.spec.ts`

**Step 1: Write the failing test**

Add focused parser tests:

```ts
it("rejects [] parameter syntax in fixed mode", () => {
  expect(() =>
    compileToIr(`void f(int vec[][]) { }`, {
      grammar: { typingMode: "typed", arrayMode: "fixed" },
    }),
  ).toThrow();
});

it("rejects sized parameter syntax in dynamic mode", () => {
  expect(() =>
    compileToIr(`void f(int vec[2][4]) { }`, {
      grammar: { typingMode: "typed", arrayMode: "dynamic" },
    }),
  ).toThrow();
});
```

**Step 2: Run test to verify it fails**

Run: `npm run test --workspace=@ts-compilator-for-java/compiler -- src/tests/grammar/typing-mode.spec.ts -t "parameter syntax"`
Expected: FAIL because parameter parsing currently consumes only `type identifier`.

**Step 3: Write minimal implementation**

Teach `parameterListStmt` to parse either scalar or array parameter forms based on `arrayMode`:

```ts
const baseType = typeStmt(iterator);
const name = iterator.consume(TOKENS.LITERALS.identifier);

if (iterator.match(TOKENS.SYMBOLS.left_bracket)) {
  return parseArrayParameter(iterator, baseType, name);
}

return { kind: "scalar", type: baseType, name: name.lexeme };
```

For fixed mode, require integer sizes in every dimension.
For dynamic mode, require empty `[]` in every dimension and infer `dimensions` from the count.

Emit local declarations for parameter names while preserving the richer descriptor for function signatures.

**Step 4: Run test to verify it passes**

Run: `npm run test --workspace=@ts-compilator-for-java/compiler -- src/tests/grammar/typing-mode.spec.ts`
Expected: PASS for valid fixed/dynamic parameter declarations and FAIL for the invalid mode-specific forms.

**Step 5: Commit**

```bash
git add packages/compiler/src/grammar/syntax/parameterListStmt.ts \
  packages/compiler/src/grammar/syntax/function-call.ts \
  packages/compiler/src/tests/grammar/typing-mode.spec.ts
git commit -m "feat(compiler): parse array parameters in signatures"
```

### Task 4: Validate array arguments structurally during function calls

**Files:**
- Modify: `packages/compiler/src/grammar/syntax/functionCallExpr.ts`
- Modify: `packages/compiler/src/grammar/syntax/argumentListStmt.ts`
- Check: `packages/compiler/src/grammar/syntax/factorStmt.ts`
- Check: `packages/compiler/src/token/TokenIterator.ts`
- Test: `packages/compiler/src/tests/grammar/type-semantics.spec.ts`

**Step 1: Write the failing test**

Add narrow tests for incompatible calls:

```ts
it("rejects passing a scalar to an array parameter", () => {
  const source = `
    void f(int vec[2][4]) { }
    int main() { int x = 1; f(x); return 0; }
  `;

  expect(() =>
    compileToIr(source, { grammar: { typingMode: "typed", arrayMode: "fixed" } }),
  ).toThrow();
});

it("rejects passing indexed access to an array parameter", () => {
  const source = `
    void f(int vec[2][4]) { }
    int main() { int vec[2][4]; f(vec[0][0]); return 0; }
  `;

  expect(() =>
    compileToIr(source, { grammar: { typingMode: "typed", arrayMode: "fixed" } }),
  ).toThrow();
});
```

**Step 2: Run test to verify it fails**

Run: `npm run test --workspace=@ts-compilator-for-java/compiler -- src/tests/grammar/type-semantics.spec.ts -t "array parameter"`
Expected: FAIL because call validation currently reasons only in scalar `ValueType` terms.

**Step 3: Write minimal implementation**

Extend call validation to inspect argument expressions and parameter descriptors:

```ts
if (param.kind === "array") {
  assertArrayArgument(argument, param, iterator);
} else {
  assertScalarArgument(argument, param, iterator);
}
```

`assertArrayArgument` should:
- require the argument to resolve to an array identifier
- compare base type
- compare dimension count
- compare exact sizes in fixed mode

Keep `vec[i][j]` classified as scalar output from `factorStmt`.

**Step 4: Run test to verify it passes**

Run: `npm run test --workspace=@ts-compilator-for-java/compiler -- src/tests/grammar/type-semantics.spec.ts`
Expected: PASS for valid array calls and FAIL for incompatible ones.

**Step 5: Commit**

```bash
git add packages/compiler/src/grammar/syntax/functionCallExpr.ts \
  packages/compiler/src/grammar/syntax/argumentListStmt.ts \
  packages/compiler/src/tests/grammar/type-semantics.spec.ts
git commit -m "feat(compiler): validate array call arguments structurally"
```

### Task 5: Bind array parameters by reference in the interpreter

**Files:**
- Modify: `packages/compiler/src/interpreter/index.ts`
- Check: `packages/compiler/src/interpreter/utils.ts`
- Check: `packages/compiler/src/interpreter/constants.ts`
- Test: `packages/compiler/src/tests/grammar/type-semantics.spec.ts`

**Step 1: Write the failing test**

Keep one runtime-focused test from Task 1 that mutates an array inside the callee and reads it in the caller.

**Step 2: Run test to verify it fails**

Run: `npm run test --workspace=@ts-compilator-for-java/compiler -- src/tests/grammar/type-semantics.spec.ts -t "parameter references"`
Expected: FAIL because parameter binding currently treats function parameters as scalar `DECLARE` initialization values.

**Step 3: Write minimal implementation**

When a function call evaluates arguments, preserve array runtime values as-is and initialize parameter slots with the same object reference:

```ts
if (isRuntimeArrayValue(initialValue)) {
  this.declareVariable(result, declaredType, initialValue);
} else {
  this.declareVariable(result, declaredType, initialValue);
}
```

The essential rule is not to clone arrays during parameter binding. If needed, add a parameter-binding helper that branches on scalar vs array descriptors while keeping current scalar behavior unchanged.

**Step 4: Run test to verify it passes**

Run: `npm run test --workspace=@ts-compilator-for-java/compiler -- src/tests/grammar/type-semantics.spec.ts`
Expected: PASS with output showing caller-visible mutation after the callee write.

**Step 5: Commit**

```bash
git add packages/compiler/src/interpreter/index.ts \
  packages/compiler/src/tests/grammar/type-semantics.spec.ts
git commit -m "feat(interpreter): pass array parameters by reference"
```

### Task 6: Run focused verification and document final behavior

**Files:**
- Modify: `packages/compiler/README.md`
- Check: `docs/plans/2026-03-25-array-parameter-design.md`
- Test: `packages/compiler/src/tests/grammar/typing-mode.spec.ts`
- Test: `packages/compiler/src/tests/grammar/type-semantics.spec.ts`

**Step 1: Write the failing doc/test gap**

Add a short README example if array parameters are part of the documented language surface:

```md
void printa(int vec[2][4]) {
  vec[0][0] = 99;
}
```

If the README already covers function signatures or arrays, extend that section instead of adding a new one.

**Step 2: Run focused verification**

Run: `npm run test --workspace=@ts-compilator-for-java/compiler -- src/tests/grammar/typing-mode.spec.ts src/tests/grammar/type-semantics.spec.ts`
Expected: PASS

**Step 3: Write minimal documentation**

Document:
- fixed parameter syntax requires exact sizes
- dynamic parameter syntax uses only empty brackets
- arrays are passed by reference

**Step 4: Run verification again**

Run: `npm run test --workspace=@ts-compilator-for-java/compiler -- src/tests/grammar/typing-mode.spec.ts src/tests/grammar/type-semantics.spec.ts`
Expected: PASS

**Step 5: Commit**

```bash
git add packages/compiler/README.md \
  docs/plans/2026-03-25-array-parameter-design.md \
  docs/plans/2026-03-25-array-parameter-implementation.md
git commit -m "docs(compiler): document array parameter semantics"
```
