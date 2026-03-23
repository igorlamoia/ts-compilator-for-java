# Boolean Literal Customization Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Add end-to-end customization for boolean literal words (`true` and `false`) across compiler config, IDE persistence, lexer execution, and Monaco editor metadata.

**Architecture:** Introduce a dedicated `booleanLiteralMap` config object instead of mixing literals into `keywordMap`. Extend the existing compiler and IDE config plumbing so one normalized source of truth drives validation, local persistence, lexer construction, and Monaco registration while preserving the existing boolean token ids.

**Tech Stack:** TypeScript, Vitest, React context state, Next.js IDE frontend, Monaco language registration, existing compiler lexer config.

---

### Task 1: Add failing compiler tests for boolean literal aliases

**Files:**
- Modify: `packages/compiler/src/tests/lexer/operator-word-aliases.spec.ts`
- Test: `packages/compiler/src/tests/lexer/operator-word-aliases.spec.ts`

**Step 1: Write the failing tests**

Add tests that assert:

```ts
it("tokenizes customized boolean literal aliases with the existing token IDs", () => {
  const lexer = new Lexer("bool active = yes;", {
    booleanLiteralMap: { true: "yes", false: "no" },
  });

  const tokens = lexer.scanTokens();

  expect(tokens.map((token) => token.type)).toContain(TOKENS.RESERVEDS.true);
});

it("rejects boolean literal aliases that conflict with operator aliases", () => {
  expect(
    () =>
      new Lexer("if yes and no {}", {
        booleanLiteralMap: { true: "and", false: "no" },
        operatorWordMap: { logical_and: "and" },
      }),
  ).toThrow(/conflict|reserved|alias/i);
});
```

**Step 2: Run test to verify it fails**

Run: `npm run test --workspace=@ts-compilator-for-java/compiler -- src/tests/lexer/operator-word-aliases.spec.ts`

Expected: FAIL because `booleanLiteralMap` is not part of lexer config or validation yet.

**Step 3: Write minimal implementation**

No implementation in this task. Stop once the failure proves the test seam.

**Step 4: Commit**

```bash
git add packages/compiler/src/tests/lexer/operator-word-aliases.spec.ts
git commit -m "test(compiler): cover boolean literal aliases"
```

### Task 2: Implement compiler config support for boolean literal aliases

**Files:**
- Modify: `packages/compiler/src/lexer/config.ts`
- Modify: `packages/compiler/src/lexer/scanners/factory.ts`
- Modify: `packages/compiler/src/lexer/scanners/identifier.ts`
- Modify: `packages/compiler/src/tests/lexer/operator-word-aliases.spec.ts`
- Test: `packages/compiler/src/tests/lexer/operator-word-aliases.spec.ts`

**Step 1: Extend the config types**

Add a dedicated type:

```ts
export type BooleanLiteralMap = {
  true?: string;
  false?: string;
};
```

and add it to `LexerConfig`.

**Step 2: Add validation and token-map helpers**

In `packages/compiler/src/lexer/config.ts`, add helper functions similar to the operator alias flow:

```ts
export function buildBooleanLiteralTokenMap(
  booleanLiteralMap: BooleanLiteralMap | undefined,
): KeywordMap
```

and:

```ts
export function validateBooleanLiteralMap(
  booleanLiteralMap: BooleanLiteralMap,
  reserved: KeywordMap,
  customKeywords?: KeywordMap,
  operatorWordMap?: OperatorWordMap,
  blockDelimiters?: LexerBlockDelimiters,
): void
```

The validator must reject:

- non identifier-like aliases
- duplicate aliases
- collisions with reserved words
- collisions with `customKeywords`
- collisions with `operatorWordMap`
- collisions with block delimiters

**Step 3: Merge boolean literal aliases into reserved-word resolution**

Update the lexer scanner factory / identifier path so configured aliases are added to the effective reserved-word lookup before identifier tokenization. Preserve token ids:

```ts
true -> 56
false -> 57
```

**Step 4: Run test to verify it passes**

Run: `npm run test --workspace=@ts-compilator-for-java/compiler -- src/tests/lexer/operator-word-aliases.spec.ts`

Expected: PASS

**Step 5: Commit**

```bash
git add packages/compiler/src/lexer/config.ts \
  packages/compiler/src/lexer/scanners/factory.ts \
  packages/compiler/src/lexer/scanners/identifier.ts \
  packages/compiler/src/tests/lexer/operator-word-aliases.spec.ts
git commit -m "feat(compiler): support boolean literal aliases"
```

### Task 3: Add failing IDE normalization tests for boolean literal config

**Files:**
- Modify: `packages/ide/src/lib/compiler-config.spec.ts`
- Test: `packages/ide/src/lib/compiler-config.spec.ts`

**Step 1: Write the failing tests**

Add tests like:

```ts
it("preserves boolean literal aliases in the normalized payload", () => {
  const normalized = normalizeCompilerConfig({
    booleanLiteralMap: { true: "verdadeiro", false: "falso" },
  });

  expect(normalized.booleanLiteralMap).toEqual({
    true: "verdadeiro",
    false: "falso",
  });
});
```

and a trimming/empty-value case.

**Step 2: Run test to verify it fails**

Run: `npm run test --workspace=@ts-compilator-for-java/ide -- src/lib/compiler-config.spec.ts`

Expected: FAIL because the IDE payload types do not yet include `booleanLiteralMap`.

**Step 3: Write minimal implementation**

No implementation in this task. Stop after proving the failure.

**Step 4: Commit**

```bash
git add packages/ide/src/lib/compiler-config.spec.ts
git commit -m "test(ide): cover boolean literal config normalization"
```

### Task 4: Implement IDE compiler-config types and normalization

**Files:**
- Modify: `packages/ide/src/entities/compiler-config.ts`
- Modify: `packages/ide/src/lib/compiler-config.ts`
- Modify: `packages/ide/src/lib/compiler-config.spec.ts`
- Test: `packages/ide/src/lib/compiler-config.spec.ts`

**Step 1: Add the shared IDE type**

In `packages/ide/src/entities/compiler-config.ts`, add:

```ts
export type IDEBooleanLiteralMap = {
  true?: string;
  false?: string;
};
```

and include it in both `IDECompilerConfigPayload` and `IDEPartialCompilerConfigPayload`.

**Step 2: Normalize the new field**

In `packages/ide/src/lib/compiler-config.ts`, add a normalization helper that trims values and drops empty strings:

```ts
function normalizeBooleanLiteralMap(
  input: IDEBooleanLiteralMap | undefined,
): IDEBooleanLiteralMap
```

Then return `booleanLiteralMap` in the normalized payload.

**Step 3: Run test to verify it passes**

Run: `npm run test --workspace=@ts-compilator-for-java/ide -- src/lib/compiler-config.spec.ts`

Expected: PASS

**Step 4: Commit**

```bash
git add packages/ide/src/entities/compiler-config.ts \
  packages/ide/src/lib/compiler-config.ts \
  packages/ide/src/lib/compiler-config.spec.ts
git commit -m "feat(ide): normalize boolean literal config"
```

### Task 5: Add failing KeywordContext tests for boolean literal persistence and validation

**Files:**
- Modify: `packages/ide/src/contexts/KeywordContext.spec.ts`
- Test: `packages/ide/src/contexts/KeywordContext.spec.ts`

**Step 1: Write the failing tests**

Add tests that cover:

- default boolean literal map returns `true` / `false`
- stored/migrated config gains default boolean literal values when missing
- keyword validation no longer hardcodes `true` / `false` as globally forbidden keywords
- a dedicated boolean literal validator rejects duplicates and conflicts

Use explicit assertions, for example:

```ts
expect(getDefaultBooleanLiteralMap()).toEqual({
  true: "true",
  false: "false",
});
```

**Step 2: Run test to verify it fails**

Run: `npm run test --workspace=@ts-compilator-for-java/ide -- src/contexts/KeywordContext.spec.ts`

Expected: FAIL because `KeywordContext` does not yet store or validate boolean literal aliases separately.

**Step 3: Write minimal implementation**

No implementation in this task.

**Step 4: Commit**

```bash
git add packages/ide/src/contexts/KeywordContext.spec.ts
git commit -m "test(ide): cover boolean literal customization state"
```

### Task 6: Implement KeywordContext boolean literal state and payload plumbing

**Files:**
- Modify: `packages/ide/src/contexts/KeywordContext.tsx`
- Modify: `packages/ide/src/lib/keyword-map.ts`
- Modify: `packages/ide/src/contexts/KeywordContext.spec.ts`
- Test: `packages/ide/src/contexts/KeywordContext.spec.ts`

**Step 1: Add default and stored state**

Extend the stored customization type with:

```ts
booleanLiteralMap: IDEBooleanLiteralMap;
```

and add:

```ts
function getDefaultBooleanLiteralMap(): IDEBooleanLiteralMap
```

to return:

```ts
{ true: "true", false: "false" }
```

**Step 2: Expose state and validation in the context**

Add context fields:

```ts
booleanLiteralMap: IDEBooleanLiteralMap;
setBooleanLiteralMap: (value: IDEBooleanLiteralMap) => void;
validateBooleanLiteralMap: (...) => string | null;
```

Validation should reject collisions against:

- other boolean literal alias
- customized keywords
- operator word aliases
- block delimiters

**Step 3: Remove the hardcoded literal prohibition from keyword validation**

Delete the fixed `RESERVED_LITERAL_WORDS` rejection in `validateCustomKeyword`, and instead let collisions be enforced against the currently active boolean literal map.

**Step 4: Include boolean literal aliases in the built compiler payload**

Update `buildLexerConfig()` so it returns:

```ts
{
  keywordMap,
  operatorWordMap,
  booleanLiteralMap,
  ...
}
```

**Step 5: Run test to verify it passes**

Run: `npm run test --workspace=@ts-compilator-for-java/ide -- src/contexts/KeywordContext.spec.ts`

Expected: PASS

**Step 6: Commit**

```bash
git add packages/ide/src/contexts/KeywordContext.tsx \
  packages/ide/src/lib/keyword-map.ts \
  packages/ide/src/contexts/KeywordContext.spec.ts
git commit -m "feat(ide): persist boolean literal customization"
```

### Task 7: Add failing editor-language tests for configurable boolean literals

**Files:**
- Modify: `packages/ide/src/utils/compiler/editor/editor-language.spec.ts`
- Test: `packages/ide/src/utils/compiler/editor/editor-language.spec.ts`

**Step 1: Write the failing tests**

Add tests that assert:

- `buildJavaMMLanguageMetadata` includes configured boolean literal words
- old defaults are not included once replaced
- autocomplete offers configured literal words instead of hardcoded `true` / `false`

Example:

```ts
const metadata = buildJavaMMLanguageMetadata(
  [{ original: "bool", custom: "bool", tokenId: 55 }],
  {},
  { true: "yes", false: "no" },
);

expect(metadata.allKeywords).toEqual(expect.arrayContaining(["yes", "no"]));
expect(metadata.allKeywords).not.toEqual(expect.arrayContaining(["true", "false"]));
```

**Step 2: Run test to verify it fails**

Run: `npm run test --workspace=@ts-compilator-for-java/ide -- src/utils/compiler/editor/editor-language.spec.ts`

Expected: FAIL because the editor still hardcodes built-in boolean literal words.

**Step 3: Write minimal implementation**

No implementation in this task.

**Step 4: Commit**

```bash
git add packages/ide/src/utils/compiler/editor/editor-language.spec.ts
git commit -m "test(ide): cover configurable boolean literals in editor metadata"
```

### Task 8: Implement Monaco/editor support for configurable boolean literals

**Files:**
- Modify: `packages/ide/src/utils/compiler/editor/editor-language.ts`
- Modify: `packages/ide/src/utils/compiler/editor/editor-language.spec.ts`
- Test: `packages/ide/src/utils/compiler/editor/editor-language.spec.ts`

**Step 1: Extend language metadata inputs**

Update `buildJavaMMLanguageMetadata` and related registration flow to accept:

```ts
booleanLiteralMap?: IDEBooleanLiteralMap
```

**Step 2: Replace hardcoded literal lists**

Remove:

```ts
const BUILT_IN_LITERALS = ["true", "false"];
```

and build the literal list from normalized config defaults plus overrides.

**Step 3: Update autocomplete**

Where completion suggestions include boolean literals, feed the configured aliases instead of hardcoded defaults.

**Step 4: Run test to verify it passes**

Run: `npm run test --workspace=@ts-compilator-for-java/ide -- src/utils/compiler/editor/editor-language.spec.ts`

Expected: PASS

**Step 5: Commit**

```bash
git add packages/ide/src/utils/compiler/editor/editor-language.ts \
  packages/ide/src/utils/compiler/editor/editor-language.spec.ts
git commit -m "feat(ide): use configurable boolean literals in editor language"
```

### Task 9: Add failing integration tests for forwarding boolean literal config

**Files:**
- Modify: `packages/ide/src/tests/integration/hooks/use-lexer-analyse.spec.ts`
- Modify: `packages/ide/src/tests/integration/compiler/run-intermediator.spec.ts`
- Modify: `packages/ide/src/tests/integration/compiler/validate-submission.spec.ts`
- Test: `packages/ide/src/tests/integration/hooks/use-lexer-analyse.spec.ts`
- Test: `packages/ide/src/tests/integration/compiler/run-intermediator.spec.ts`
- Test: `packages/ide/src/tests/integration/compiler/validate-submission.spec.ts`

**Step 1: Write the failing assertions**

Update the mocked `buildLexerConfig()` payloads and constructor expectations to include:

```ts
booleanLiteralMap: { true: "yes", false: "no" }
```

**Step 2: Run targeted tests to verify they fail**

Run: `npm run test --workspace=@ts-compilator-for-java/ide -- src/tests/integration/hooks/use-lexer-analyse.spec.ts`

Run: `npm run test --workspace=@ts-compilator-for-java/ide -- src/tests/integration/compiler/run-intermediator.spec.ts`

Run: `npm run test --workspace=@ts-compilator-for-java/ide -- src/tests/integration/compiler/validate-submission.spec.ts`

Expected: FAIL because one or more integration paths do not forward the new config field yet.

**Step 3: Write minimal implementation**

No implementation in this task.

**Step 4: Commit**

```bash
git add packages/ide/src/tests/integration/hooks/use-lexer-analyse.spec.ts \
  packages/ide/src/tests/integration/compiler/run-intermediator.spec.ts \
  packages/ide/src/tests/integration/compiler/validate-submission.spec.ts
git commit -m "test(ide): cover boolean literal config forwarding"
```

### Task 10: Implement end-to-end forwarding and modal wiring

**Files:**
- Modify: `packages/ide/src/hooks/useLexerAnalyse.ts`
- Modify: `packages/ide/src/hooks/useIntermediateCode.ts`
- Modify: `packages/ide/src/hooks/useSubmissionValidation.ts`
- Modify: `packages/ide/src/components/...` for the keyword customization modal UI
- Modify: `packages/ide/src/tests/integration/hooks/use-lexer-analyse.spec.ts`
- Modify: `packages/ide/src/tests/integration/compiler/run-intermediator.spec.ts`
- Modify: `packages/ide/src/tests/integration/compiler/validate-submission.spec.ts`
- Test: `packages/ide/src/tests/integration/hooks/use-lexer-analyse.spec.ts`
- Test: `packages/ide/src/tests/integration/compiler/run-intermediator.spec.ts`
- Test: `packages/ide/src/tests/integration/compiler/validate-submission.spec.ts`

**Step 1: Wire the new field through execution hooks**

Update every compiler-facing request/construction path to pass `booleanLiteralMap` through unchanged.

**Step 2: Add the modal section**

In the existing customization modal component, add a dedicated "Boolean literals" section with two controlled inputs bound to `KeywordContext`.

**Step 3: Add local validation messages**

Ensure the modal shows validation feedback before save when a boolean literal alias is invalid.

**Step 4: Run the targeted integration tests**

Run:

```bash
npm run test --workspace=@ts-compilator-for-java/ide -- src/tests/integration/hooks/use-lexer-analyse.spec.ts
npm run test --workspace=@ts-compilator-for-java/ide -- src/tests/integration/compiler/run-intermediator.spec.ts
npm run test --workspace=@ts-compilator-for-java/ide -- src/tests/integration/compiler/validate-submission.spec.ts
```

Expected: PASS

**Step 5: Commit**

```bash
git add packages/ide/src/hooks/useLexerAnalyse.ts \
  packages/ide/src/hooks/useIntermediateCode.ts \
  packages/ide/src/hooks/useSubmissionValidation.ts \
  packages/ide/src/components \
  packages/ide/src/tests/integration/hooks/use-lexer-analyse.spec.ts \
  packages/ide/src/tests/integration/compiler/run-intermediator.spec.ts \
  packages/ide/src/tests/integration/compiler/validate-submission.spec.ts
git commit -m "feat(ide): wire boolean literal customization end to end"
```

### Task 11: Run focused verification and update docs if needed

**Files:**
- Modify: `packages/compiler/README.md` (only if compiler config docs mention customizable words explicitly)
- Modify: `packages/ide/README.md` (only if IDE customization docs mention keyword/operator customization explicitly)

**Step 1: Run focused compiler and IDE test suites**

Run:

```bash
npm run test --workspace=@ts-compilator-for-java/compiler -- src/tests/lexer/operator-word-aliases.spec.ts
npm run test --workspace=@ts-compilator-for-java/ide -- src/lib/compiler-config.spec.ts
npm run test --workspace=@ts-compilator-for-java/ide -- src/contexts/KeywordContext.spec.ts
npm run test --workspace=@ts-compilator-for-java/ide -- src/utils/compiler/editor/editor-language.spec.ts
npm run test --workspace=@ts-compilator-for-java/ide -- src/tests/integration/hooks/use-lexer-analyse.spec.ts
```

Expected: PASS

**Step 2: Update docs only if user-facing behavior is documented elsewhere**

If README files already describe customization scope, add a short note that boolean literal words are now configurable in the IDE/compiler config flow.

**Step 3: Commit**

```bash
git add packages/compiler/README.md packages/ide/README.md
git commit -m "docs: note boolean literal customization"
```

