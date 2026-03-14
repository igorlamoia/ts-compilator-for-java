# Operator Word Customization Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Add configurable word aliases for logical and relational operators across the compiler, IDE customizer, API payloads, and Monaco language registration while keeping symbolic operators fully supported.

**Architecture:** Keep operator semantics token-based. Add a dedicated `operatorWordMap` config path that flows from IDE state to API handlers to compiler lexer configuration, then merge those aliases into the lexer's identifier lookup so alias words emit the same token IDs as the existing symbolic operators. Update Monaco metadata and the customizer UI to treat these aliases as first-class configurable language elements with shared collision validation.

**Tech Stack:** TypeScript, Vitest, React, Next.js API routes, Monaco editor integration, existing compiler lexer/token constants.

---

### Task 1: Add compiler config support for operator word aliases

**Files:**
- Modify: `packages/compiler/src/lexer/config.ts`
- Modify: `packages/compiler/src/token/constants/relationals.ts`
- Modify: `packages/compiler/src/token/constants/logicals.ts`
- Modify: `packages/ide/src/entities/compiler-config.ts`
- Modify: `packages/ide/src/lib/compiler-config.ts`
- Test: `packages/ide/src/lib/compiler-config.spec.ts`

**Step 1: Write the failing config normalization test**

```ts
it("preserves operator word aliases in the normalized payload", () => {
  const normalized = normalizeCompilerConfig({
    operatorWordMap: {
      logical_and: "and",
      less_equal: "less_equal",
    },
  });

  expect(normalized.operatorWordMap).toEqual({
    logical_and: "and",
    less_equal: "less_equal",
  });
});
```

**Step 2: Run test to verify it fails**

Run: `npm run test --workspace=@ts-compilator-for-java/ide -- src/lib/compiler-config.spec.ts`
Expected: FAIL because `IDECompilerConfigPayload` and `normalizeCompilerConfig` do not include `operatorWordMap`.

**Step 3: Add the shared operator alias types and defaults**

```ts
export type IDEOperatorWordMap = {
  logical_or?: string;
  logical_and?: string;
  logical_not?: string;
  less?: string;
  less_equal?: string;
  greater?: string;
  greater_equal?: string;
  equal?: string;
  not_equal?: string;
};
```

Update compiler and IDE config files so:
- lexer config accepts `operatorWordMap`
- IDE payload types include `operatorWordMap`
- normalization preserves sanitized alias values
- shared constants expose the token IDs for the 9 operator slots

**Step 4: Run test to verify it passes**

Run: `npm run test --workspace=@ts-compilator-for-java/ide -- src/lib/compiler-config.spec.ts`
Expected: PASS

**Step 5: Commit**

```bash
git add packages/compiler/src/lexer/config.ts \
  packages/compiler/src/token/constants/relationals.ts \
  packages/compiler/src/token/constants/logicals.ts \
  packages/ide/src/entities/compiler-config.ts \
  packages/ide/src/lib/compiler-config.ts \
  packages/ide/src/lib/compiler-config.spec.ts
git commit -m "feat(config): add operator word alias payload"
```

### Task 2: Make the compiler accept operator alias words

**Files:**
- Modify: `packages/compiler/src/lexer/config.ts`
- Modify: `packages/compiler/src/lexer/index.ts`
- Modify: `packages/compiler/src/lexer/scanners/identifier.ts`
- Modify: `packages/compiler/src/token/constants/index.ts`
- Modify: `packages/compiler/src/tests/lexer/string.spec.ts`
- Create: `packages/compiler/src/tests/lexer/operator-word-aliases.spec.ts`

**Step 1: Write the failing lexer tests**

```ts
describe("operator word aliases", () => {
  it("tokenizes logical aliases with the same token IDs as symbols", () => {
    const lexer = new Lexer("if a and not b {}", {
      operatorWordMap: {
        logical_and: "and",
        logical_not: "not",
      },
    });

    const tokens = lexer.scanTokens();

    expect(tokens.map((token) => token.type)).toEqual(
      expect.arrayContaining([TOKENS.LOGICALS.logical_and, TOKENS.LOGICALS.logical_not]),
    );
  });

  it("tokenizes relational aliases with the same token IDs as symbols", () => {
    const lexer = new Lexer("if a less_equal b {}", {
      operatorWordMap: {
        less_equal: "less_equal",
      },
    });

    const tokens = lexer.scanTokens();

    expect(tokens.map((token) => token.type)).toContain(TOKENS.RELATIONALS.less_equal);
  });
});
```

**Step 2: Run test to verify it fails**

Run: `npm run test --workspace=@ts-compilator-for-java/compiler -- src/tests/lexer/operator-word-aliases.spec.ts`
Expected: FAIL because identifier scanning currently treats alias words as plain identifiers.

**Step 3: Merge operator aliases into the lexer identifier map**

```ts
const effectiveKeywordMap = {
  ...TOKENS.RESERVEDS,
  ...customKeywords,
  ...buildOperatorWordTokenMap(operatorWordMap),
};
```

Implement validation in `packages/compiler/src/lexer/config.ts` so aliases:
- match identifier-style rules
- do not duplicate each other
- do not collide with keyword overrides
- do not collide with block delimiters

Leave `packages/compiler/src/token/mappings/operators-tokens.ts` unchanged so symbol operators still scan normally.

**Step 4: Add a failing collision test and make it pass**

```ts
it("rejects aliases that conflict with customized keywords", () => {
  expect(
    () =>
      new Lexer("if a and b {}", {
        customKeywords: { se: TOKENS.RESERVEDS.if },
        operatorWordMap: { logical_and: "se" },
      }),
  ).toThrow(/conflict|reserved|keyword/i);
});
```

Run: `npm run test --workspace=@ts-compilator-for-java/compiler -- src/tests/lexer/operator-word-aliases.spec.ts`
Expected: PASS

**Step 5: Commit**

```bash
git add packages/compiler/src/lexer/config.ts \
  packages/compiler/src/lexer/index.ts \
  packages/compiler/src/lexer/scanners/identifier.ts \
  packages/compiler/src/token/constants/index.ts \
  packages/compiler/src/tests/lexer/operator-word-aliases.spec.ts \
  packages/compiler/src/tests/lexer/string.spec.ts
git commit -m "feat(compiler): support operator word aliases in lexer"
```

### Task 3: Propagate operator aliases through IDE state and API payloads

**Files:**
- Modify: `packages/ide/src/contexts/KeywordContext.tsx`
- Modify: `packages/ide/src/lib/compiler-config.ts`
- Modify: `packages/ide/src/lib/keyword-map.ts`
- Modify: `packages/ide/src/pages/api/lexer.ts`
- Modify: `packages/ide/src/pages/api/intermediator.ts`
- Modify: `packages/ide/src/pages/api/__tests__/intermediator-config.spec.ts`
- Create: `packages/ide/src/pages/api/__tests__/lexer-config.spec.ts`

**Step 1: Write the failing API propagation tests**

```ts
it("passes operatorWordMap to the lexer endpoint", () => {
  const req = {
    body: {
      sourceCode: "if a and b {}",
      locale: "pt-BR",
      operatorWordMap: { logical_and: "and" },
    },
  } as any;

  handler(req, res);

  expect(LexerMock).toHaveBeenCalledWith(
    "if a and b {}",
    expect.objectContaining({
      operatorWordMap: { logical_and: "and" },
    }),
  );
});
```

```ts
it("preserves operatorWordMap when building the intermediate compiler config", () => {
  handler(req, res);

  expect(TokenIteratorMock).toHaveBeenCalledWith(
    expect.any(Array),
    expect.objectContaining({
      grammar: expect.any(Object),
      operatorWordMap: { logical_and: "and" },
    }),
  );
});
```

**Step 2: Run tests to verify they fail**

Run: `npm run test --workspace=@ts-compilator-for-java/ide -- src/pages/api/__tests__/intermediator-config.spec.ts src/pages/api/__tests__/lexer-config.spec.ts`
Expected: FAIL because the payload types and handlers do not yet forward `operatorWordMap`.

**Step 3: Extend the IDE storage and payload builders**

```ts
type StoredKeywordCustomization = {
  mappings: KeywordMapping[];
  operatorWordMap: IDEOperatorWordMap;
  blockDelimiters: BlockDelimiters;
  semicolonMode: IDESemicolonMode;
  blockMode: IDEBlockMode;
  typingMode: IDETypingMode;
};
```

Update `KeywordContext` so:
- defaults include the 9 operator alias words
- local storage loads and persists `operatorWordMap`
- reset restores those defaults
- `buildLexerConfig()` includes `operatorWordMap`

Update API handlers to pass `operatorWordMap` through to compiler constructors.

**Step 4: Run tests to verify they pass**

Run: `npm run test --workspace=@ts-compilator-for-java/ide -- src/pages/api/__tests__/intermediator-config.spec.ts src/pages/api/__tests__/lexer-config.spec.ts src/lib/compiler-config.spec.ts`
Expected: PASS

**Step 5: Commit**

```bash
git add packages/ide/src/contexts/KeywordContext.tsx \
  packages/ide/src/lib/compiler-config.ts \
  packages/ide/src/lib/keyword-map.ts \
  packages/ide/src/pages/api/lexer.ts \
  packages/ide/src/pages/api/intermediator.ts \
  packages/ide/src/pages/api/__tests__/intermediator-config.spec.ts \
  packages/ide/src/pages/api/__tests__/lexer-config.spec.ts \
  packages/ide/src/lib/compiler-config.spec.ts
git commit -m "feat(ide): propagate operator alias config"
```

### Task 4: Add operator alias editing and validation to the customizer

**Files:**
- Modify: `packages/ide/src/components/keyword-customizer.tsx`
- Modify: `packages/ide/src/contexts/KeywordContext.tsx`
- Modify: `packages/ide/src/i18n/locales/en/ui.ts`
- Modify: `packages/ide/src/i18n/locales/pt-BR/ui.ts`
- Modify: `packages/ide/src/i18n/locales/pt-PT/ui.ts`
- Modify: `packages/ide/src/i18n/locales/es/ui.ts`
- Create: `packages/ide/src/lib/operator-word-map.spec.ts`

**Step 1: Write the failing validation tests**

```ts
describe("operator word alias validation", () => {
  it("rejects duplicate operator aliases", () => {
    const error = validateOperatorWordMap(
      { logical_and: "and", logical_or: "and" },
      defaultKeywordMappings,
      { open: "", close: "" },
    );

    expect(error).toMatch(/already|duplicate/i);
  });

  it("rejects aliases that collide with customized keywords", () => {
    const error = validateOperatorWordMap(
      { logical_and: "if" },
      defaultKeywordMappings,
      { open: "", close: "" },
    );

    expect(error).toMatch(/keyword|conflict/i);
  });
});
```

**Step 2: Run test to verify it fails**

Run: `npm run test --workspace=@ts-compilator-for-java/ide -- src/lib/operator-word-map.spec.ts`
Expected: FAIL because no dedicated validator exists yet.

**Step 3: Implement shared validation and wire it into the modal**

```ts
const OPERATOR_ALIAS_REGEX = /^[A-Za-z_][A-Za-z0-9_]*$/;

export function validateOperatorWordMap(
  operatorWordMap: IDEOperatorWordMap,
  mappings: KeywordMapping[],
  blockDelimiters: BlockDelimiters,
): string | null {
  // validate format, duplicates, keyword collisions, delimiter collisions
}
```

Update the modal so it:
- renders a dedicated logical/relational alias section
- keeps draft operator alias state separate from keyword mappings
- blocks save when operator alias validation fails
- resets aliases to the default words

**Step 4: Run tests to verify they pass**

Run: `npm run test --workspace=@ts-compilator-for-java/ide -- src/lib/operator-word-map.spec.ts`
Expected: PASS

**Step 5: Commit**

```bash
git add packages/ide/src/components/keyword-customizer.tsx \
  packages/ide/src/contexts/KeywordContext.tsx \
  packages/ide/src/i18n/locales/en/ui.ts \
  packages/ide/src/i18n/locales/pt-BR/ui.ts \
  packages/ide/src/i18n/locales/pt-PT/ui.ts \
  packages/ide/src/i18n/locales/es/ui.ts \
  packages/ide/src/lib/operator-word-map.spec.ts
git commit -m "feat(ui): add operator alias customization"
```

### Task 5: Update Monaco language metadata for operator alias highlighting

**Files:**
- Modify: `packages/ide/src/utils/compiler/editor/editor-language.ts`
- Modify: `packages/ide/src/utils/compiler/editor/editor-language.spec.ts`
- Modify: `packages/ide/src/utils/compiler/editor/types.ts`
- Modify: `packages/ide/src/hooks/useEditor.ts`

**Step 1: Write the failing editor metadata tests**

```ts
it("includes configured operator aliases in Monarch operators", () => {
  const metadata = buildJavaMMLanguageMetadata(
    [{ original: "if", custom: "if", tokenId: 28 }],
    { logical_and: "and", less_equal: "less_equal" },
  );

  expect(metadata.operatorWords).toEqual(
    expect.arrayContaining(["and", "less_equal"]),
  );
});
```

```ts
it("registers operator alias words in the Monaco language", () => {
  registerJavaMMLanguage(monaco as never, keywordMappings, {
    operatorWordMap: { logical_and: "and" },
  } as never);

  const language = monaco.languages.setMonarchTokensProvider.mock.calls[0]?.[1];

  expect(language.operators).toContain("and");
});
```

**Step 2: Run test to verify it fails**

Run: `npm run test --workspace=@ts-compilator-for-java/ide -- src/utils/compiler/editor/editor-language.spec.ts`
Expected: FAIL because language metadata only knows about symbol operators.

**Step 3: Thread operator aliases into language registration**

```ts
export type JavaMMLanguageMetadata = {
  allKeywords: string[];
  operatorWords: string[];
  semanticGroups: Record<JavaMMSemanticGroupName, string[]>;
};
```

Update:
- metadata builder to accept `operatorWordMap`
- Monarch configuration to merge alias words into the operator classification
- `useEditor` registration flow so operator alias changes trigger re-registration

**Step 4: Run tests to verify they pass**

Run: `npm run test --workspace=@ts-compilator-for-java/ide -- src/utils/compiler/editor/editor-language.spec.ts`
Expected: PASS

**Step 5: Commit**

```bash
git add packages/ide/src/utils/compiler/editor/editor-language.ts \
  packages/ide/src/utils/compiler/editor/editor-language.spec.ts \
  packages/ide/src/utils/compiler/editor/types.ts \
  packages/ide/src/hooks/useEditor.ts
git commit -m "feat(editor): highlight operator alias words"
```

### Task 6: Run end-to-end verification for compiler and IDE paths

**Files:**
- Test: `packages/compiler/src/tests/lexer/operator-word-aliases.spec.ts`
- Test: `packages/ide/src/lib/compiler-config.spec.ts`
- Test: `packages/ide/src/lib/operator-word-map.spec.ts`
- Test: `packages/ide/src/pages/api/__tests__/intermediator-config.spec.ts`
- Test: `packages/ide/src/pages/api/__tests__/lexer-config.spec.ts`
- Test: `packages/ide/src/utils/compiler/editor/editor-language.spec.ts`

**Step 1: Run the compiler lexer tests**

Run: `npm run test --workspace=@ts-compilator-for-java/compiler -- src/tests/lexer/operator-word-aliases.spec.ts`
Expected: PASS

**Step 2: Run the IDE unit and API tests**

Run: `npm run test --workspace=@ts-compilator-for-java/ide -- src/lib/compiler-config.spec.ts src/lib/operator-word-map.spec.ts src/pages/api/__tests__/intermediator-config.spec.ts src/pages/api/__tests__/lexer-config.spec.ts src/utils/compiler/editor/editor-language.spec.ts`
Expected: PASS

**Step 3: Run the full targeted test sweep once**

Run: `npm run test --workspace=@ts-compilator-for-java/compiler -- src/tests/lexer/operator-word-aliases.spec.ts && npm run test --workspace=@ts-compilator-for-java/ide -- src/lib/compiler-config.spec.ts src/lib/operator-word-map.spec.ts src/pages/api/__tests__/intermediator-config.spec.ts src/pages/api/__tests__/lexer-config.spec.ts src/utils/compiler/editor/editor-language.spec.ts`
Expected: PASS across both workspaces

**Step 4: Commit**

```bash
git add packages/compiler/src/tests/lexer/operator-word-aliases.spec.ts \
  packages/ide/src/lib/compiler-config.spec.ts \
  packages/ide/src/lib/operator-word-map.spec.ts \
  packages/ide/src/pages/api/__tests__/intermediator-config.spec.ts \
  packages/ide/src/pages/api/__tests__/lexer-config.spec.ts \
  packages/ide/src/utils/compiler/editor/editor-language.spec.ts
git commit -m "test: verify operator word customization end to end"
```
