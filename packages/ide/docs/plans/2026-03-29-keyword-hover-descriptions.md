# Keyword Hover Descriptions Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Add persistent semantic descriptions for every customizable language item and show them as structured Monaco hover content in the IDE.

**Architecture:** Extend the keyword customization state with a semantic documentation map keyed by stable item IDs, then centralize semantic category and fallback-description logic in a shared helper. Feed that helper into Monaco hover registration and the inline keyword customizer UI so hover content survives lexeme renames and stays part of the language configuration.

**Tech Stack:** Next.js, React 19, TypeScript, Monaco Editor, Vitest, localStorage-backed keyword customization context

---

### Task 1: Persist documentation metadata in customization and config state

**Files:**
- Modify: `src/entities/compiler-config.ts`
- Modify: `src/contexts/keyword/types.ts`
- Modify: `src/contexts/keyword/KeywordContext.tsx`
- Modify: `src/lib/compiler-config.ts`
- Modify: `src/lib/compiler-config.spec.ts`
- Modify: `src/lib/keyword-customization.ts`
- Modify: `src/contexts/keyword/KeywordContext.spec.ts`

**Step 1: Write the failing tests**

Add assertions like:

```ts
it("preserves language documentation entries in normalized compiler config", () => {
  const normalized = normalizeCompilerConfig({
    languageDocumentation: {
      "keyword.print": { description: "Exibe valores" },
    },
  });

  expect(normalized.languageDocumentation).toEqual({
    "keyword.print": { description: "Exibe valores" },
  });
});

it("hydrates old localStorage payloads with an empty documentation map", () => {
  localStorage.setItem(
    "keyword-customization",
    JSON.stringify({
      mappings: getDefaultKeywordMappings(),
      operatorWordMap: {},
      booleanLiteralMap: {},
      statementTerminatorLexeme: "",
      blockDelimiters: { open: "", close: "" },
      modes: {
        semicolon: "optional-eol",
        block: "delimited",
        typing: "typed",
        array: "fixed",
      },
    }),
  );

  // render KeywordProvider and inspect capturedKeywords?.customization
  expect(capturedKeywords?.customization.languageDocumentation).toEqual({});
});
```

**Step 2: Run tests to verify they fail**

Run:

```bash
npx vitest run src/lib/compiler-config.spec.ts src/contexts/keyword/KeywordContext.spec.ts
```

Expected: FAIL with missing `languageDocumentation` fields in types, normalization, or provider state.

**Step 3: Write the minimal implementation**

Add a shared type to the config/state layer:

```ts
export type IDELanguageDocumentationEntry = {
  description: string;
};

export type IDELanguageDocumentationMap = Record<
  string,
  IDELanguageDocumentationEntry
>;
```

Wire it through:

- `IDEKeywordCustomizationState`
- `IDECompilerConfigPayload`
- `IDEPartialCompilerConfigPayload`
- `StoredKeywordCustomization`
- `getDefaultCustomizationState()`
- `normalizeCustomization()`
- `normalizeCompilerConfig()`
- `buildLexerConfigFromCustomization()`

Normalization rules:

- missing map -> `{}`
- unknown keys -> keep if value shape is valid
- trim `description`
- never let `languageDocumentation` be `undefined` in customization state

**Step 4: Run tests to verify they pass**

Run:

```bash
npx vitest run src/lib/compiler-config.spec.ts src/contexts/keyword/KeywordContext.spec.ts
```

Expected: PASS.

**Step 5: Commit**

```bash
git add src/entities/compiler-config.ts src/contexts/keyword/types.ts src/contexts/keyword/KeywordContext.tsx src/lib/compiler-config.ts src/lib/compiler-config.spec.ts src/lib/keyword-customization.ts src/contexts/keyword/KeywordContext.spec.ts
git commit -m "feat: persist keyword hover documentation state"
```

### Task 2: Centralize semantic item metadata and lexeme resolution

**Files:**
- Create: `src/lib/language-documentation.ts`
- Create: `src/lib/language-documentation.spec.ts`

**Step 1: Write the failing tests**

Add tests that lock down semantic IDs, categories, rename-safe resolution, and fallback descriptions:

```ts
it("resolves renamed keywords by semantic id", () => {
  const entry = resolveDocumentationByLexeme("mostrar", {
    mappings: [{ original: "print", custom: "mostrar", tokenId: 33 }],
    operatorWordMap: {},
    booleanLiteralMap: {},
    statementTerminatorLexeme: "",
    blockDelimiters: { open: "", close: "" },
    modes: {
      semicolon: "optional-eol",
      block: "delimited",
      typing: "typed",
      array: "fixed",
    },
    languageDocumentation: {
      "keyword.print": { description: "Exibe valores" },
    },
  });

  expect(entry?.id).toBe("keyword.print");
  expect(entry?.lexeme).toBe("mostrar");
  expect(entry?.category).toBe("Entrada/Saída");
  expect(entry?.description).toContain("Exibe valores");
});

it("generates fallback descriptions for blank user entries", () => {
  const entry = resolveDocumentationByLexeme("inicio", customization);
  expect(entry?.description).toContain("abertura");
});
```

**Step 2: Run tests to verify they fail**

Run:

```bash
npx vitest run src/lib/language-documentation.spec.ts
```

Expected: FAIL because the helper module does not exist yet.

**Step 3: Write the minimal implementation**

Create a shared helper that exposes:

```ts
export type ResolvedLanguageDocumentation = {
  id: string;
  lexeme: string;
  category: string;
  description: string;
};

export function resolveDocumentationByLexeme(
  lexeme: string,
  customization: StoredKeywordCustomization,
): ResolvedLanguageDocumentation | null;

export function getDefaultDocumentationDescription(id: string): string;
```

Implementation requirements:

- semantic IDs for keywords, operator aliases, booleans, terminator, and delimiters
- central category lookup
- lexeme lookup against current customization state
- user description wins when non-empty
- fallback description comes from semantic ID
- delimiter entries only resolve when the delimiter value is active and non-empty

**Step 4: Run tests to verify they pass**

Run:

```bash
npx vitest run src/lib/language-documentation.spec.ts
```

Expected: PASS.

**Step 5: Commit**

```bash
git add src/lib/language-documentation.ts src/lib/language-documentation.spec.ts
git commit -m "feat: add semantic language documentation catalog"
```

### Task 3: Register Monaco hover provider from the active customization

**Files:**
- Modify: `src/utils/compiler/editor/editor-language.ts`
- Modify: `src/utils/compiler/editor/editor-language.spec.ts`
- Modify: `src/contexts/keyword/KeywordContext.tsx`

**Step 1: Write the failing tests**

Extend the Monaco tests to cover hover registration and disposal:

```ts
it("registers a hover provider that returns title, category, and description", () => {
  const hoverProvider = vi.fn();
  const monaco = {
    languages: {
      getLanguages: () => [],
      register: vi.fn(),
      setMonarchTokensProvider: vi.fn(),
      setLanguageConfiguration: vi.fn(),
      registerCompletionItemProvider: vi.fn(() => ({ dispose: vi.fn() })),
      registerHoverProvider: vi.fn(() => ({ dispose: vi.fn() })),
    },
  };

  registerJavaMMLanguage(monaco as never, mappings, {
    languageDocumentation: {
      "keyword.print": { description: "Exibe valores" },
    },
  } as never);

  const provider = monaco.languages.registerHoverProvider.mock.calls[0]?.[1];
  const result = provider.provideHover(
    {
      getWordAtPosition: () => ({ word: "mostrar", startColumn: 1, endColumn: 8 }),
    },
    { lineNumber: 1, column: 2 },
  );

  expect(result.contents[0].value).toContain("mostrar");
  expect(result.contents[1].value).toContain("Entrada/Saída");
  expect(result.contents[2].value).toContain("Exibe valores");
});
```

Also add a provider lifecycle test that verifies the previous hover disposable is released before re-registering.

**Step 2: Run tests to verify they fail**

Run:

```bash
npx vitest run src/utils/compiler/editor/editor-language.spec.ts src/contexts/keyword/KeywordContext.spec.ts
```

Expected: FAIL because hover registration does not exist and the context does not forward `languageDocumentation`.

**Step 3: Write the minimal implementation**

In `src/utils/compiler/editor/editor-language.ts`:

- add `languageDocumentation?: IDELanguageDocumentationMap` to `JavaMMLanguageOptions`
- store a `hoverProviderDisposable`
- register `monaco.languages.registerHoverProvider(...)`
- resolve the hovered lexeme through `resolveDocumentationByLexeme`
- return Markdown hover content in this shape:

```ts
return {
  range,
  contents: [
    { value: `**${entry.lexeme}**` },
    { value: entry.category },
    { value: entry.description },
  ],
};
```

In `src/contexts/keyword/KeywordContext.tsx`, pass `languageDocumentation` into `updateJavaMMKeywords(...)` along with the existing options.

**Step 4: Run tests to verify they pass**

Run:

```bash
npx vitest run src/utils/compiler/editor/editor-language.spec.ts src/contexts/keyword/KeywordContext.spec.ts
```

Expected: PASS.

**Step 5: Commit**

```bash
git add src/utils/compiler/editor/editor-language.ts src/utils/compiler/editor/editor-language.spec.ts src/contexts/keyword/KeywordContext.tsx
git commit -m "feat: show semantic hover documentation in monaco"
```

### Task 4: Add inline description editing to the keyword customizer

**Files:**
- Create: `src/components/keyword-customizer/documented-field.tsx`
- Modify: `src/components/keyword-customizer.tsx`
- Modify: `src/components/keyword-customizer.spec.tsx`
- Modify: `src/components/keyword-customizer/steps/variables-step.tsx`
- Modify: `src/components/keyword-customizer/steps/structure-step.tsx`
- Modify: `src/components/keyword-customizer/steps/rules-step.tsx`
- Modify: `src/components/keyword-customizer/steps/flow-step.tsx`

**Step 1: Write the failing tests**

Add UI tests that prove descriptions are editable inline and stored by semantic item:

```ts
it("updates the print description without breaking the renamed lexeme", () => {
  const setCustomization = vi.fn();
  useKeywordsMock.mockReturnValue(
    createKeywordsContext({
      setCustomization,
    }),
  );

  const { container } = render();
  clickButtonByText(container, "Continuar");

  const outputLexeme = container.querySelector('input[value="print"]');
  const descriptionField = Array.from(container.querySelectorAll("textarea")).find(
    (node) => node.getAttribute("aria-label")?.includes("print"),
  );

  // rename lexeme and edit description
  // assert draft state eventually includes languageDocumentation["keyword.print"]
});
```

Also add assertions that:

- operator alias descriptions render in `RulesStep`
- terminator and delimiter descriptions render in `StructureStep`
- the saved customization passed to `setCustomization` includes `languageDocumentation`

**Step 2: Run tests to verify they fail**

Run:

```bash
npx vitest run src/components/keyword-customizer.spec.tsx
```

Expected: FAIL because no inline description controls exist yet.

**Step 3: Write the minimal implementation**

Create a reusable field component similar to:

```tsx
type DocumentedFieldProps = {
  label: string;
  value: string;
  description: string;
  onValueChange: (value: string) => void;
  onDescriptionChange: (value: string) => void;
  placeholder?: string;
};
```

Use it across the wizard steps instead of hand-rolled single-input cards where the item is customizable.

In `src/components/keyword-customizer.tsx`:

- add helper functions that map each edited UI field to a semantic ID
- add `handleDocumentationChange(id, description)`
- keep description state inside `draftCustomization.languageDocumentation`
- preserve descriptions when presets or lexeme edits update mappings

Do not add a new wizard step. Keep the editing experience inline.

**Step 4: Run tests to verify they pass**

Run:

```bash
npx vitest run src/components/keyword-customizer.spec.tsx
```

Expected: PASS.

**Step 5: Commit**

```bash
git add src/components/keyword-customizer/documented-field.tsx src/components/keyword-customizer.tsx src/components/keyword-customizer.spec.tsx src/components/keyword-customizer/steps/variables-step.tsx src/components/keyword-customizer/steps/structure-step.tsx src/components/keyword-customizer/steps/rules-step.tsx src/components/keyword-customizer/steps/flow-step.tsx
git commit -m "feat: edit hover descriptions in keyword customizer"
```

### Task 5: Run the focused regression suite and fix any broken integration assumptions

**Files:**
- Modify as needed based on failing tests from prior tasks
- Re-run tests in:
  - `src/lib/compiler-config.spec.ts`
  - `src/contexts/keyword/KeywordContext.spec.ts`
  - `src/lib/language-documentation.spec.ts`
  - `src/utils/compiler/editor/editor-language.spec.ts`
  - `src/components/keyword-customizer.spec.tsx`

**Step 1: Write the failing regression expectation**

Before making any cleanup edit, add or tighten one missing integration assertion if gaps remain. Good candidates:

```ts
it("keeps hover documentation after renaming print to mostrar", () => {
  // assert context -> monaco options -> hover resolver stay aligned
});
```

Only add this test if the existing suite still leaves a behavior gap after Tasks 1-4.

**Step 2: Run the focused regression suite**

Run:

```bash
npx vitest run src/lib/compiler-config.spec.ts src/contexts/keyword/KeywordContext.spec.ts src/lib/language-documentation.spec.ts src/utils/compiler/editor/editor-language.spec.ts src/components/keyword-customizer.spec.tsx
```

Expected: PASS. If anything fails, fix the smallest integration issue and re-run the same command until green.

**Step 3: Apply the minimal cleanup**

Typical cleanup should stay small:

- remove duplicate semantic category tables
- tighten helper naming
- fix fragile test selectors
- make hover registration no-op cleanly in mocked Monaco environments

Avoid feature creep. No review-step redesign, no markdown editor, no extra persistence layer.

**Step 4: Run the focused regression suite again**

Run:

```bash
npx vitest run src/lib/compiler-config.spec.ts src/contexts/keyword/KeywordContext.spec.ts src/lib/language-documentation.spec.ts src/utils/compiler/editor/editor-language.spec.ts src/components/keyword-customizer.spec.tsx
```

Expected: PASS.

**Step 5: Commit**

```bash
git add src/lib/compiler-config.spec.ts src/contexts/keyword/KeywordContext.spec.ts src/lib/language-documentation.ts src/lib/language-documentation.spec.ts src/utils/compiler/editor/editor-language.ts src/utils/compiler/editor/editor-language.spec.ts src/components/keyword-customizer/documented-field.tsx src/components/keyword-customizer.tsx src/components/keyword-customizer.spec.tsx src/components/keyword-customizer/steps/variables-step.tsx src/components/keyword-customizer/steps/structure-step.tsx src/components/keyword-customizer/steps/rules-step.tsx src/components/keyword-customizer/steps/flow-step.tsx src/entities/compiler-config.ts src/contexts/keyword/types.ts src/lib/compiler-config.ts src/lib/keyword-customization.ts
git commit -m "test: verify keyword hover documentation integration"
```
