# Statement Terminator Word Scanner Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Add a dedicated lexer scanner for custom statement terminators so identifier-like terminators such as `uai` work correctly, keep symbolic terminators working, validate word collisions, and align Monaco highlighting so only `;` and the configured custom terminator are colored as statement delimiters.

**Architecture:** Introduce a dedicated compiler scanner responsible for matching `statementTerminatorLexeme` with exact lexeme and identifier-boundary semantics, then update lexer dispatch to route through it before identifier and generic symbol scanning. Extend validation to reject collisions with configurable language words, and thread the terminator setting into Monaco language registration so editor highlighting mirrors compiler behavior for both literal `;` and the configured custom terminator.

**Tech Stack:** TypeScript, Vitest, compiler lexer/parser modules, Monaco Monarch language configuration in the IDE.

---

### Task 1: Cover lexer behavior for identifier-like terminators

**Files:**
- Modify: `packages/compiler/src/tests/lexer/statement-terminator-config.spec.ts`

**Step 1: Write the failing tests**

Add tests that assert:

```ts
it("tokenizes an identifier-like statement terminator as semicolon token", () => {
  const lexer = new Lexer("int main() { bool ok = false uai }", {
    statementTerminatorLexeme: "uai",
    booleanLiteralMap: { true: "true", false: "false" },
    locale: "en",
  });

  const semicolonTokens = lexer
    .scanTokens()
    .filter((token) => token.type === TOKENS.SYMBOLS.semicolon);

  expect(semicolonTokens).toHaveLength(1);
  expect(semicolonTokens[0]?.lexeme).toBe("uai");
});

it("does not match an identifier-like terminator inside a larger identifier", () => {
  const lexer = new Lexer("int main() { int uai123 = 1; }", {
    statementTerminatorLexeme: "uai",
    locale: "en",
  });

  const identifiers = lexer
    .scanTokens()
    .filter((token) => token.type === TOKENS.LITERALS.identifier)
    .map((token) => token.lexeme);

  expect(identifiers).toContain("uai123");
});

it("tokenizes underscore-prefixed identifier-like terminators", () => {
  const lexer = new Lexer("int main() { print(1) _uai }", {
    statementTerminatorLexeme: "_uai",
    locale: "en",
  });

  const semicolonTokens = lexer
    .scanTokens()
    .filter((token) => token.type === TOKENS.SYMBOLS.semicolon);

  expect(semicolonTokens).toHaveLength(1);
  expect(semicolonTokens[0]?.lexeme).toBe("_uai");
});
```

**Step 2: Run test to verify it fails**

Run: `npm run test --workspace=@ts-compilator-for-java/compiler -- src/tests/lexer/statement-terminator-config.spec.ts`

Expected: FAIL because `uai` is currently tokenized as an identifier instead of a semicolon token.

**Step 3: Write minimal implementation**

Do not implement the full scanner yet. Add only enough temporary changes to confirm the failure reproduces cleanly if the test file needs import or fixture adjustments.

**Step 4: Run test to verify the failure is specific**

Run: `npm run test --workspace=@ts-compilator-for-java/compiler -- src/tests/lexer/statement-terminator-config.spec.ts`

Expected: FAIL only on the new identifier-like terminator assertions.

**Step 5: Commit**

```bash
git add packages/compiler/src/tests/lexer/statement-terminator-config.spec.ts
git commit -m "test: cover word-like statement terminators"
```

### Task 2: Implement a dedicated statement terminator scanner in the compiler

**Files:**
- Create: `packages/compiler/src/lexer/scanners/statement-terminator.ts`
- Modify: `packages/compiler/src/lexer/scanners/index.ts`
- Modify: `packages/compiler/src/lexer/scanners/factory.ts`
- Modify: `packages/compiler/src/lexer/scanners/symbol-and-operator.ts`
- Modify: `packages/compiler/src/lexer/lexer-helpers.ts`

**Step 1: Write the failing implementation-level expectations**

Before coding, confirm the new tests from Task 1 are still failing and note the exact failure.

Run: `npm run test --workspace=@ts-compilator-for-java/compiler -- src/tests/lexer/statement-terminator-config.spec.ts`

Expected: FAIL on identifier-like terminator tokenization.

**Step 2: Write minimal implementation**

Implement a dedicated scanner with logic equivalent to:

```ts
export default class StatementTerminatorScanner extends LexerScanner {
  canScan(startChar: string): boolean {
    const lexeme = this.lexer.statementTerminatorLexeme;
    if (!lexeme) return false;
    if (!lexeme.startsWith(startChar)) return false;
    if (!this.lexer.source.startsWith(lexeme.slice(1), this.lexer.current)) {
      return false;
    }

    if (!isIdentifierStart(lexeme[0])) return true;

    const nextChar = this.lexer.source[this.lexer.current + lexeme.length - 1] ?? "\0";
    return !isAlphaNumeric(nextChar) && !isIdentifierStart(nextChar);
  }

  run(): void {
    const lexeme = this.lexer.statementTerminatorLexeme!;
    this.lexer.advance(lexeme.length - 1);
    this.lexer.addToken(TOKENS.SYMBOLS.semicolon, lexeme);
  }
}
```

Update the scanner factory so:

- the dedicated scanner is checked before `IdentifierScanner`
- if the scanner does not confirm a full match, dispatch falls back to the normal identifier or symbol scanner

Keep `SymbolAndOperatorScanner` focused on fixed symbols and operators rather than the custom terminator.

**Step 3: Run test to verify it passes**

Run: `npm run test --workspace=@ts-compilator-for-java/compiler -- src/tests/lexer/statement-terminator-config.spec.ts`

Expected: PASS

**Step 4: Run regression tests**

Run: `npm run test --workspace=@ts-compilator-for-java/compiler -- src/tests/grammar/semicolon.spec.ts`

Expected: PASS, including existing custom symbolic terminator coverage.

**Step 5: Commit**

```bash
git add \
  packages/compiler/src/lexer/scanners/statement-terminator.ts \
  packages/compiler/src/lexer/scanners/index.ts \
  packages/compiler/src/lexer/scanners/factory.ts \
  packages/compiler/src/lexer/scanners/symbol-and-operator.ts \
  packages/compiler/src/lexer/lexer-helpers.ts
git commit -m "feat: add dedicated statement terminator scanner"
```

### Task 3: Add validation coverage for word collisions

**Files:**
- Modify: `packages/compiler/src/tests/lexer/statement-terminator-config.spec.ts`
- Modify: `packages/compiler/src/lexer/config.ts`
- Optional modify: `packages/compiler/src/lexer/index.ts`

**Step 1: Write the failing tests**

Add tests that assert the lexer rejects configurations such as:

```ts
expect(() =>
  new Lexer("int main() {}", {
    statementTerminatorLexeme: "if",
    locale: "en",
  }),
).toThrow(/statement terminator/i);

expect(() =>
  new Lexer("int main() {}", {
    statementTerminatorLexeme: "yes",
    booleanLiteralMap: { true: "yes", false: "no" },
    locale: "en",
  }),
).toThrow(/statement terminator/i);

expect(() =>
  new Lexer("int main() {}", {
    statementTerminatorLexeme: "and",
    operatorWordMap: { logical_and: "and" },
    locale: "en",
  }),
).toThrow(/statement terminator/i);

expect(() =>
  new Lexer("int main() {}", {
    statementTerminatorLexeme: "inicio",
    blockDelimiters: { open: "inicio", close: "fim" },
    locale: "en",
  }),
).toThrow(/statement terminator/i);
```

**Step 2: Run test to verify it fails**

Run: `npm run test --workspace=@ts-compilator-for-java/compiler -- src/tests/lexer/statement-terminator-config.spec.ts`

Expected: FAIL because current validation only blocks whitespace, `;`, and fixed symbol characters.

**Step 3: Write minimal implementation**

Extend validation so the normalized terminator is checked against:

- built-in reserved keywords
- custom keyword overrides
- normalized operator aliases
- normalized boolean literal aliases
- normalized block delimiters

Keep the validation messages generic to existing statement terminator error expectations unless the existing tests require a more specific string.

**Step 4: Run tests to verify it passes**

Run: `npm run test --workspace=@ts-compilator-for-java/compiler -- src/tests/lexer/statement-terminator-config.spec.ts`

Expected: PASS

**Step 5: Commit**

```bash
git add packages/compiler/src/tests/lexer/statement-terminator-config.spec.ts packages/compiler/src/lexer/config.ts packages/compiler/src/lexer/index.ts
git commit -m "fix: reject conflicting statement terminators"
```

### Task 4: Add grammar coverage for word-like terminators

**Files:**
- Modify: `packages/compiler/src/tests/grammar/semicolon.spec.ts`

**Step 1: Write the failing tests**

Add grammar tests that assert:

```ts
it("accepts an identifier-like configured terminator in required mode", () => {
  expect(() =>
    compileToIr("int main() { print(1) uai }", {
      lexer: { statementTerminatorLexeme: "uai" },
      grammar: { semicolonMode: "required" },
    }),
  ).not.toThrow();
});

it("rejects literal semicolon for normal statements when a word terminator is active", () => {
  expect(() =>
    compileToIr("int main() { print(1); }", {
      lexer: { statementTerminatorLexeme: "uai" },
      grammar: { semicolonMode: "required" },
    }),
  ).toThrow(/Unexpected token/);
});

it("keeps literal semicolons inside for headers when a word terminator is active", () => {
  expect(() =>
    compileToIr("int main() { for (int i = 0; i < 3; i++) { print(i) uai } }", {
      lexer: { statementTerminatorLexeme: "uai" },
      grammar: { semicolonMode: "required" },
    }),
  ).not.toThrow();
});
```

**Step 2: Run test to verify it fails or exposes gaps**

Run: `npm run test --workspace=@ts-compilator-for-java/compiler -- src/tests/grammar/semicolon.spec.ts`

Expected: FAIL before the lexer and validation updates are fully integrated, or PASS only after Tasks 2 and 3 are complete.

**Step 3: Write minimal implementation**

If any failures remain after Tasks 2 and 3, adjust only the parser integration points necessary to preserve:

- configured terminator for normal statements
- literal `;` inside `for (...)`
- configured-lexeme error messages

Prefer no parser code change if the existing `consumeStmtTerminator` behavior already passes.

**Step 4: Run tests to verify it passes**

Run: `npm run test --workspace=@ts-compilator-for-java/compiler -- src/tests/grammar/semicolon.spec.ts`

Expected: PASS

**Step 5: Commit**

```bash
git add packages/compiler/src/tests/grammar/semicolon.spec.ts packages/compiler/src/grammar/syntax/statementTerminator.ts packages/compiler/src/token/TokenIterator.ts
git commit -m "test: cover word-like statement terminators in grammar"
```

### Task 5: Cover Monaco delimiter highlighting changes

**Files:**
- Modify: `packages/ide/src/utils/compiler/editor/editor-language.spec.ts`
- Modify: `packages/ide/src/utils/compiler/editor/editor-language.ts`

**Step 1: Write the failing tests**

Add tests that assert:

```ts
it("registers the configured statement terminator in the Monaco language", () => {
  const monaco = {
    languages: {
      getLanguages: () => [],
      register: vi.fn(),
      setMonarchTokensProvider: vi.fn(),
      setLanguageConfiguration: vi.fn(),
      registerCompletionItemProvider: vi.fn(() => ({ dispose: vi.fn() })),
      CompletionItemKind: { Keyword: 1, Snippet: 2, Operator: 3, Value: 4 },
      CompletionItemInsertTextRule: { InsertAsSnippet: 4 },
    },
  };

  registerJavaMMLanguage(
    monaco as never,
    [{ original: "if", custom: "if", tokenId: 28 }] as never,
    { statementTerminatorLexeme: "uai" } as never,
  );

  const language = monaco.languages.setMonarchTokensProvider.mock.calls[0]?.[1];
  expect(language.statementTerminators).toEqual(expect.arrayContaining([";", "uai"]));
});

it("does not keep comma and dot in the delimiter matcher", () => {
  const language = buildJavaMMMonarchLanguage({
    allKeywords: [],
    operatorWords: [],
    semanticGroups: { types: [], conditionals: [], loops: [], flow: [], io: [] },
    statementTerminators: [";", "uai"],
  });

  expect(JSON.stringify(language.tokenizer.root)).not.toContain("[;,.]");
});
```

If the tokenizer shape makes direct assertions awkward, extract a helper that returns the delimiter regex source and test that helper instead.

**Step 2: Run test to verify it fails**

Run: `npm run test --workspace=@ts-compilator-for-java/ide -- src/utils/compiler/editor/editor-language.spec.ts`

Expected: FAIL because Monaco metadata currently does not receive `statementTerminatorLexeme` and still uses `[;,.]`.

**Step 3: Write minimal implementation**

Update the editor language helpers so:

- `JavaMMLanguageOptions` includes `statementTerminatorLexeme?: string`
- metadata includes a `statementTerminators` collection containing literal `;` and the configured custom terminator when present
- the Monarch tokenizer uses those terminators for delimiter coloring
- identifier-like terminators use boundary-aware matching
- `,` and `.` are no longer colored by this delimiter rule

Keep the implementation small. If regex construction becomes noisy, add a focused helper in the same module and test it directly.

**Step 4: Run tests to verify it passes**

Run: `npm run test --workspace=@ts-compilator-for-java/ide -- src/utils/compiler/editor/editor-language.spec.ts`

Expected: PASS

**Step 5: Commit**

```bash
git add packages/ide/src/utils/compiler/editor/editor-language.spec.ts packages/ide/src/utils/compiler/editor/editor-language.ts
git commit -m "feat(ide): highlight custom statement terminators"
```

### Task 6: Thread the terminator config through IDE language registration

**Files:**
- Modify: `packages/ide/src/contexts/editor/EditorContext.tsx`
- Modify: `packages/ide/src/contexts/KeywordContext.tsx`
- Modify: `packages/ide/src/entities/compiler-config.ts`
- Modify: any direct registration callers found by search, likely `packages/ide/src/components/editor.tsx` or nearby editor setup modules

**Step 1: Write the failing test**

Add or extend an IDE unit test so a changed `statementTerminatorLexeme` is passed into language registration. If there is no existing focused test at the registration boundary, create one near the editor context.

Minimal expectation:

```ts
expect(registerJavaMMLanguage).toHaveBeenCalledWith(
  expect.anything(),
  expect.anything(),
  expect.objectContaining({ statementTerminatorLexeme: "uai" }),
);
```

**Step 2: Run test to verify it fails**

Run: `npm run test --workspace=@ts-compilator-for-java/ide -- src/contexts/editor/EditorContext.spec.tsx`

Expected: FAIL because the terminator config is not yet forwarded into Monaco registration.

**Step 3: Write minimal implementation**

Plumb `statementTerminatorLexeme` from the existing IDE customization state into the editor language registration options without widening unrelated configuration paths.

**Step 4: Run tests to verify it passes**

Run: `npm run test --workspace=@ts-compilator-for-java/ide -- src/contexts/editor/EditorContext.spec.tsx`

Expected: PASS

**Step 5: Commit**

```bash
git add packages/ide/src/contexts/editor/EditorContext.tsx packages/ide/src/contexts/KeywordContext.tsx packages/ide/src/entities/compiler-config.ts packages/ide/src/components/editor.tsx
git commit -m "feat(ide): pass statement terminator to Monaco"
```

### Task 7: Run focused verification and document results

**Files:**
- Modify: `docs/plans/2026-03-25-statement-terminator-word-scanner.md`

**Step 1: Run compiler verification**

Run: `npm run test --workspace=@ts-compilator-for-java/compiler -- src/tests/lexer/statement-terminator-config.spec.ts src/tests/grammar/semicolon.spec.ts`

Expected: PASS

**Step 2: Run IDE verification**

Run: `npm run test --workspace=@ts-compilator-for-java/ide -- src/utils/compiler/editor/editor-language.spec.ts`

Expected: PASS

**Step 3: Run broader regression checks if fast enough**

Run: `npm run test --workspace=@ts-compilator-for-java/ide -- src/tests/integration/hooks/use-lexer-analyse.spec.ts src/tests/integration/hooks/use-intermediator-code.spec.ts`

Expected: PASS

**Step 4: Record verification notes**

Append a short verification section to this plan file with:

- commands run
- whether they passed
- any deferred gaps

**Step 5: Commit**

```bash
git add docs/plans/2026-03-25-statement-terminator-word-scanner.md
git commit -m "docs: record statement terminator scanner verification"
```

## Verification Notes

- `npm run test --workspace=@ts-compilator-for-java/compiler -- src/tests/lexer/statement-terminator-config.spec.ts src/tests/grammar/semicolon.spec.ts`
  - PASS
  - 2 files passed, 40 tests passed
- `npx vitest run packages/ide/src/utils/compiler/editor/editor-language.spec.ts packages/ide/src/contexts/KeywordContext.spec.ts`
  - PASS
  - 2 files passed, 25 tests passed
- `npx vitest run packages/ide/src/tests/integration/hooks/use-lexer-analyse.spec.ts packages/ide/src/tests/integration/hooks/use-intermediator-code.spec.ts`
  - PASS
  - 2 files passed, 4 tests passed
- `npx vitest run packages/ide/src/contexts/KeywordContext.spec.ts packages/ide/src/components/keyword-customizer.spec.tsx packages/ide/src/utils/compiler/editor/editor-language.spec.ts packages/ide/src/tests/integration/hooks/use-lexer-analyse.spec.ts packages/ide/src/tests/integration/hooks/use-intermediator-code.spec.ts`
  - PASS
  - 5 files passed, 39 tests passed

Notes:
- The original Task 5 workspace command for `editor-language.spec.ts` did not target that unit test file through the package script, so direct `vitest` invocation was used for IDE unit verification.
- A final review found client-side validation gaps for statement terminator collisions; these were fixed in `KeywordContext` and `KeywordCustomizer`, including parity for remapped keywords and default boolean literals, and re-verified in the combined IDE command above.
- No deferred gaps remain for the scoped compiler and IDE paths touched by this implementation.
