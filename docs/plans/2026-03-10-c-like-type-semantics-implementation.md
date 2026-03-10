# C-Like Type Semantics Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Add C-like `int`/`float` behavior in typed mode by warning on lossy `float -> int` conversions at compile time, truncating toward zero at runtime, and fixing keyword customizer validation so required fields block save.

**Architecture:** Keep the current lexer -> parser -> intermediate code -> interpreter pipeline. Extend `TokenIterator` with lightweight semantic state for variable/function types and compiler warnings, then make the interpreter enforce typed storage on assignment, parameter binding, and return propagation. Reuse the existing issue/warning flow so intermediate analysis returns warnings to the IDE without a new diagnostics system.

**Tech Stack:** TypeScript, Vitest, React, Next.js API routes, existing compiler issue model, current interpreter instruction set.

---

### Task 1: Add a compiler test seam for warnings

**Files:**
- Modify: `packages/compiler/src/token/TokenIterator.ts`
- Modify: `packages/compiler/src/tests/grammar/helpers.ts`
- Create: `packages/compiler/src/tests/grammar/type-semantics.spec.ts`

**Step 1: Write the failing test helper expectations**

```ts
import { describe, expect, it } from "vitest";
import { compileProgram } from "./helpers";

describe("Type semantics warnings", () => {
  it("reports a warning when assigning a float literal to an int", () => {
    const result = compileProgram(`
      int main() {
        int x = 3.9;
        return x;
      }
    `);

    expect(result.error).toBeNull();
    expect(result.warnings).toHaveLength(1);
    expect(result.warnings[0]?.code).toMatch(/int|lossy|conversion/i);
  });
});
```

**Step 2: Run test to verify it fails**

Run: `npm run test --workspace=@ts-compilator-for-java/compiler -- src/tests/grammar/type-semantics.spec.ts`
Expected: FAIL because helpers only return instructions and `TokenIterator` does not expose compiler warnings yet.

**Step 3: Write the minimal helper API**

```ts
export function compileProgram(source: string, options?: CompileToIrOptions) {
  const lexer = new Lexer(source, { locale, ...(options?.lexer ?? {}) });
  const tokens = lexer.scanTokens();
  const iterator = new TokenIterator(tokens, {
    locale,
    grammar: options?.grammar,
  });
  const instructions = iterator.generateIntermediateCode();

  return {
    instructions,
    warnings: iterator.getWarnings(),
    infos: iterator.getInfos(),
    error: null,
  };
}
```

**Step 4: Run test to verify it still fails for the right reason**

Run: `npm run test --workspace=@ts-compilator-for-java/compiler -- src/tests/grammar/type-semantics.spec.ts`
Expected: FAIL because no lossy-conversion warning is emitted yet.

**Step 5: Commit**

```bash
git add packages/compiler/src/token/TokenIterator.ts \
  packages/compiler/src/tests/grammar/helpers.ts \
  packages/compiler/src/tests/grammar/type-semantics.spec.ts
git commit -m "test(compiler): add warning seam for type semantics"
```

### Task 2: Add compile-time type tracking and lossy conversion warnings

**Files:**
- Modify: `packages/compiler/src/token/TokenIterator.ts`
- Modify: `packages/compiler/src/grammar/syntax/declarationStmt.ts`
- Modify: `packages/compiler/src/grammar/syntax/attributeStmt.ts`
- Modify: `packages/compiler/src/grammar/syntax/function-call.ts`
- Modify: `packages/compiler/src/grammar/syntax/functionCallExpr.ts`
- Modify: `packages/compiler/src/grammar/syntax/parameterListStmt.ts`
- Modify: `packages/compiler/src/grammar/syntax/returnStmt.ts`
- Modify: `packages/compiler/src/grammar/syntax/factorStmt.ts`
- Modify: `packages/compiler/src/grammar/syntax/unitaryStmt.ts`
- Modify: `packages/compiler/src/grammar/syntax/multStmt.ts`
- Modify: `packages/compiler/src/grammar/syntax/addStmt.ts`
- Modify: `packages/compiler/src/grammar/syntax/relationalStmt.ts`
- Modify: `packages/compiler/src/grammar/syntax/orStmt.ts`
- Modify: `packages/compiler/src/grammar/syntax/andStmt.ts`
- Modify: `packages/compiler/src/i18n/locales/en/grammar.ts`
- Modify: `packages/compiler/src/i18n/locales/pt-BR/grammar.ts`
- Modify: `packages/compiler/src/i18n/locales/pt-PT/grammar.ts`
- Modify: `packages/compiler/src/i18n/locales/es/grammar.ts`
- Test: `packages/compiler/src/tests/grammar/type-semantics.spec.ts`

**Step 1: Expand the failing compiler tests**

```ts
it("warns when returning a float expression from an int function", () => {
  const result = compileProgram(`
    int main() {
      return 3.9;
    }
  `);

  expect(result.warnings).toHaveLength(1);
});

it("warns when passing a float expression to an int parameter", () => {
  const result = compileProgram(`
    int soma(int a) { return a; }
    int main() { return soma(4.2); }
  `);

  expect(result.warnings).toHaveLength(1);
});
```

**Step 2: Run test to verify it fails**

Run: `npm run test --workspace=@ts-compilator-for-java/compiler -- src/tests/grammar/type-semantics.spec.ts`
Expected: FAIL because expression types and function signatures are not tracked.

**Step 3: Add minimal semantic state to `TokenIterator`**

```ts
type ValueType = "int" | "float" | "string" | "bool" | "void" | "dynamic" | "unknown";

addWarning(code: string, line: number, column: number, params?: Record<string, string | number | boolean>): void
getWarnings(): IssueWarning[]
enterScope(): void
exitScope(): void
declareSymbol(name: string, type: ValueType): void
resolveSymbol(name: string): ValueType
declareFunction(name: string, returnType: ValueType, params: ValueType[]): void
resolveFunction(name: string): { returnType: ValueType; params: ValueType[] } | null
warnIfLossyIntConversion(targetType: ValueType, sourceType: ValueType, token: Token): void
```

**Step 4: Thread expression type information through grammar helpers**

```ts
type ExprResult = {
  place: string;
  type: ValueType;
  token: Token;
};
```

Use these return types in expression-producing grammar files so:
- integer literals infer `int`
- float literals infer `float`
- identifiers resolve declared type
- arithmetic with a `float` operand yields `float`
- relational/logical operations yield `bool`
- function calls use declared return type

**Step 5: Emit warnings at write boundaries**

```ts
iterator.warnIfLossyIntConversion(variableType, expr.type, expr.token);
iterator.emitter.emit("=", variableName, expr.place, null);
```

Apply this in:
- variable initialization and reassignment
- parameter binding
- return statements

**Step 6: Run tests to verify they pass**

Run: `npm run test --workspace=@ts-compilator-for-java/compiler -- src/tests/grammar/type-semantics.spec.ts`
Expected: PASS

**Step 7: Commit**

```bash
git add packages/compiler/src/token/TokenIterator.ts \
  packages/compiler/src/grammar/syntax/declarationStmt.ts \
  packages/compiler/src/grammar/syntax/attributeStmt.ts \
  packages/compiler/src/grammar/syntax/function-call.ts \
  packages/compiler/src/grammar/syntax/functionCallExpr.ts \
  packages/compiler/src/grammar/syntax/parameterListStmt.ts \
  packages/compiler/src/grammar/syntax/returnStmt.ts \
  packages/compiler/src/grammar/syntax/factorStmt.ts \
  packages/compiler/src/grammar/syntax/unitaryStmt.ts \
  packages/compiler/src/grammar/syntax/multStmt.ts \
  packages/compiler/src/grammar/syntax/addStmt.ts \
  packages/compiler/src/grammar/syntax/relationalStmt.ts \
  packages/compiler/src/grammar/syntax/orStmt.ts \
  packages/compiler/src/grammar/syntax/andStmt.ts \
  packages/compiler/src/i18n/locales/en/grammar.ts \
  packages/compiler/src/i18n/locales/pt-BR/grammar.ts \
  packages/compiler/src/i18n/locales/pt-PT/grammar.ts \
  packages/compiler/src/i18n/locales/es/grammar.ts \
  packages/compiler/src/tests/grammar/type-semantics.spec.ts
git commit -m "feat(compiler): warn on lossy int conversions"
```

### Task 3: Enforce runtime truncation for `int`

**Files:**
- Modify: `packages/compiler/src/interpreter/index.ts`
- Modify: `packages/compiler/src/interpreter/utils.ts`
- Modify: `packages/compiler/src/interpreter/constants.ts`
- Modify: `packages/compiler/src/tests/grammar/helpers.ts`
- Modify: `packages/compiler/src/tests/grammar/type-semantics.spec.ts`

**Step 1: Add failing execution tests**

```ts
it("truncates toward zero when storing float into int", async () => {
  const result = await executeProgram(`
    int main() {
      int x = 3.9;
      print(x);
      return 0;
    }
  `);

  expect(result.output).toBe("3");
});

it("truncates negative floats toward zero for int", async () => {
  const result = await executeProgram(`
    int main() {
      int x = -3.9;
      print(x);
      return 0;
    }
  `);

  expect(result.output).toBe("-3");
});
```

**Step 2: Run test to verify it fails**

Run: `npm run test --workspace=@ts-compilator-for-java/compiler -- src/tests/grammar/type-semantics.spec.ts`
Expected: FAIL because the interpreter stores JS numbers without declared type coercion.

**Step 3: Make interpreter storage type-aware**

```ts
type RuntimeSlot = {
  type: string;
  value: unknown;
};

private coerceForType(type: string, value: unknown): unknown {
  if (type === "int" && typeof value === "number") {
    return value < 0 ? Math.ceil(value) : Math.floor(value);
  }
  if (type === "float" && typeof value === "number") {
    return value;
  }
  return value;
}
```

Update variable declaration/storage so:
- `DECLARE` creates a typed slot
- assignment updates slot value through `coerceForType`
- parameter binding uses declared parameter type
- return propagation for typed functions uses the same coercion path

**Step 4: Run tests to verify they pass**

Run: `npm run test --workspace=@ts-compilator-for-java/compiler -- src/tests/grammar/type-semantics.spec.ts`
Expected: PASS

**Step 5: Commit**

```bash
git add packages/compiler/src/interpreter/index.ts \
  packages/compiler/src/interpreter/utils.ts \
  packages/compiler/src/interpreter/constants.ts \
  packages/compiler/src/tests/grammar/helpers.ts \
  packages/compiler/src/tests/grammar/type-semantics.spec.ts
git commit -m "feat(interpreter): truncate float values for int storage"
```

### Task 4: Return compiler warnings from the intermediate analysis API

**Files:**
- Modify: `packages/ide/src/pages/api/intermediator.ts`
- Modify: `packages/ide/src/pages/api/__tests__/intermediator-config.spec.ts`
- Modify: `packages/ide/src/hooks/useIntermediatorCode.ts`

**Step 1: Add the failing API test**

```ts
it("returns compiler warnings from TokenIterator", () => {
  mockGenerateIntermediateCode.mockReturnValue([]);
  TokenIteratorMock.mockImplementation(() => ({
    generateIntermediateCode: mockGenerateIntermediateCode,
    getWarnings: () => [{ code: "grammar.lossy_int_conversion", message: "warn", line: 2, column: 9, type: "warning", params: null }],
    getInfos: () => [],
  }));

  handler(req, res);

  expect(json).toHaveBeenCalledWith(
    expect.objectContaining({
      warnings: [expect.objectContaining({ code: "grammar.lossy_int_conversion" })],
    }),
  );
});
```

**Step 2: Run test to verify it fails**

Run: `npm run test --workspace=@ts-compilator-for-java/ide -- src/pages/api/__tests__/intermediator-config.spec.ts`
Expected: FAIL because the handler hardcodes `warnings: []`.

**Step 3: Implement minimal API propagation**

```ts
const warnings = typeof iterator.getWarnings === "function" ? iterator.getWarnings() : [];
const infos = typeof iterator.getInfos === "function" ? iterator.getInfos() : [];
```

Return these in the success payload and keep existing error behavior.

**Step 4: Run tests to verify they pass**

Run: `npm run test --workspace=@ts-compilator-for-java/ide -- src/pages/api/__tests__/intermediator-config.spec.ts`
Expected: PASS

**Step 5: Commit**

```bash
git add packages/ide/src/pages/api/intermediator.ts \
  packages/ide/src/pages/api/__tests__/intermediator-config.spec.ts \
  packages/ide/src/hooks/useIntermediatorCode.ts
git commit -m "feat(ide): surface compiler warnings from intermediate analysis"
```

### Task 5: Cover runtime validation submission flow for compiler warnings

**Files:**
- Modify: `packages/ide/src/pages/api/submissions/validate.ts`
- Modify: `packages/ide/src/pages/api/__tests__/submission-config.spec.ts`

**Step 1: Add failing submission test coverage**

```ts
it("includes compiler warnings from intermediate generation", async () => {
  TokenIteratorMock.mockImplementation(() => ({
    generateIntermediateCode: () => [],
    getWarnings: () => [{ message: "possible lossy conversion", line: 3 }],
    getInfos: () => [],
  }));

  await handler(req, res);

  expect(body.warnings).toContain(expect.stringMatching(/lossy conversion/i));
});
```

**Step 2: Run test to verify it fails**

Run: `npm run test --workspace=@ts-compilator-for-java/ide -- src/pages/api/__tests__/submission-config.spec.ts`
Expected: FAIL because validation only collects lexer warnings today.

**Step 3: Implement minimal warning merge**

```ts
const compilerWarnings =
  typeof iterator.getWarnings === "function" ? iterator.getWarnings() : [];
compilerWarnings.forEach((w) =>
  warnings.push(`Aviso (linha ${w.line}): ${w.message}`),
);
```

**Step 4: Run tests to verify they pass**

Run: `npm run test --workspace=@ts-compilator-for-java/ide -- src/pages/api/__tests__/submission-config.spec.ts`
Expected: PASS

**Step 5: Commit**

```bash
git add packages/ide/src/pages/api/submissions/validate.ts \
  packages/ide/src/pages/api/__tests__/submission-config.spec.ts
git commit -m "feat(ide): include compiler warnings in submission validation"
```

### Task 6: Fix keyword customizer required-field validation

**Files:**
- Modify: `packages/ide/src/components/keyword-customizer.tsx`
- Modify: `packages/ide/src/contexts/KeywordContext.tsx`
- Create: `packages/ide/src/components/keyword-customizer.spec.tsx`

**Step 1: Add failing component tests**

```tsx
it("blocks save when a required keyword is blank", async () => {
  renderWithProviders(<KeywordCustomizer />);

  await user.clear(screen.getByLabelText(/keyword-custom-input/i));
  await user.click(screen.getByRole("button", { name: /salvar/i }));

  expect(screen.getByText(/não pode ser vazia/i)).toBeInTheDocument();
  expect(mockSetIsOpen).not.toHaveBeenCalledWith(false);
});

it("blocks save when block delimiters are required but invalid", async () => {
  renderWithProviders(<KeywordCustomizer />);

  await user.click(screen.getByRole("button", { name: /delimitadores de bloco/i }));
  await user.type(screen.getByPlaceholderText(/abertura/i), "begin");
  await user.click(screen.getByRole("button", { name: /salvar/i }));

  expect(screen.getByText(/fechamento/i)).toBeInTheDocument();
});
```

**Step 2: Run test to verify it fails**

Run: `npm run test --workspace=@ts-compilator-for-java/ide -- src/components/keyword-customizer.spec.tsx`
Expected: FAIL because the component does not currently have direct coverage for required-field blocking behavior.

**Step 3: Tighten validation before persistence**

Ensure `handleSave()`:
- validates every keyword mapping
- validates required block delimiters when in delimited mode
- does not call persistence setters if any validation fails
- keeps the dialog open and surfaces the relevant inline error

If typing mode makes a declaration keyword mandatory in the saved configuration, add a dedicated validation rule in `KeywordContext.validateKeyword()`.

**Step 4: Run tests to verify they pass**

Run: `npm run test --workspace=@ts-compilator-for-java/ide -- src/components/keyword-customizer.spec.tsx`
Expected: PASS

**Step 5: Commit**

```bash
git add packages/ide/src/components/keyword-customizer.tsx \
  packages/ide/src/contexts/KeywordContext.tsx \
  packages/ide/src/components/keyword-customizer.spec.tsx
git commit -m "fix(ide): enforce required validation in keyword customizer"
```

### Task 7: Full verification sweep

**Files:**
- No new files

**Step 1: Run compiler tests**

Run: `npm run test --workspace=@ts-compilator-for-java/compiler`
Expected: PASS

**Step 2: Run targeted IDE tests**

Run: `npm run test --workspace=@ts-compilator-for-java/ide -- src/pages/api/__tests__/intermediator-config.spec.ts src/pages/api/__tests__/submission-config.spec.ts src/components/keyword-customizer.spec.tsx`
Expected: PASS

**Step 3: Run IDE build**

Run: `npm run build --workspace=@ts-compilator-for-java/ide`
Expected: PASS

**Step 4: Review working tree**

Run: `git status --short`
Expected: only intended implementation changes are present

**Step 5: Commit final verification adjustments if needed**

```bash
git add -A
git commit -m "test: verify c-like type semantics end-to-end"
```
