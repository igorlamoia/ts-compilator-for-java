# Statement Terminator Customization Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Add a configurable normal statement terminator lexeme while preserving existing `semicolonMode` behavior and keeping literal `;` mandatory inside `for (...)` headers.

**Architecture:** Introduce a dedicated `statementTerminatorLexeme` config that flows from IDE state into compiler lexer/parser configuration. The lexer recognizes the configured non-whitespace lexeme for normal statements, while the parser continues to treat `for (...)` separators as literal `;`. Validation lives in both compiler-facing config helpers and IDE-facing customization state so invalid lexemes are rejected before compile time.

**Tech Stack:** TypeScript, Vitest, React/Next.js, shared compiler package

---

### Task 1: Define shared config surface

**Files:**
- Modify: `packages/compiler/src/lexer/config.ts`
- Modify: `packages/ide/src/entities/compiler-config.ts`
- Modify: `packages/ide/src/lib/compiler-config.ts`
- Test: `packages/ide/src/lib/compiler-config.spec.ts`

**Step 1: Write the failing test**

Add a normalization test in `packages/ide/src/lib/compiler-config.spec.ts`:

```ts
it("normalizes statement terminator lexeme", () => {
  const normalized = normalizeCompilerConfig({
    statementTerminatorLexeme: " !! ",
    grammar: { semicolonMode: "required" },
  });

  expect(normalized.statementTerminatorLexeme).toBe("!!");
  expect(normalized.grammar.semicolonMode).toBe("required");
});
```

**Step 2: Run test to verify it fails**

Run: `npm test -- --run packages/ide/src/lib/compiler-config.spec.ts`

Expected: FAIL because `statementTerminatorLexeme` is missing from the payload types and normalization logic.

**Step 3: Write minimal implementation**

Add the new optional field to the compiler-facing types:

```ts
export type LexerConfig = {
  customKeywords?: KeywordMap;
  operatorWordMap?: OperatorWordMap;
  booleanLiteralMap?: BooleanLiteralMap;
  statementTerminatorLexeme?: string;
  blockDelimiters?: LexerBlockDelimiters;
  locale?: string;
  indentationBlock?: boolean;
  tabWidth?: number;
};
```

Add the same field to IDE config payload types and normalize it in `packages/ide/src/lib/compiler-config.ts`:

```ts
const normalizedStatementTerminator =
  typeof input.statementTerminatorLexeme === "string"
    ? input.statementTerminatorLexeme.trim()
    : "";

return {
  keywordMap: input.keywordMap ?? {},
  operatorWordMap: normalizeOperatorWordMap(input.operatorWordMap),
  booleanLiteralMap: normalizeBooleanLiteralMap(input.booleanLiteralMap),
  ...(normalizedStatementTerminator
    ? { statementTerminatorLexeme: normalizedStatementTerminator }
    : {}),
  grammar,
  indentationBlock,
};
```

**Step 4: Run test to verify it passes**

Run: `npm test -- --run packages/ide/src/lib/compiler-config.spec.ts`

Expected: PASS for the new normalization case and existing config tests.

**Step 5: Commit**

```bash
git add packages/compiler/src/lexer/config.ts packages/ide/src/entities/compiler-config.ts packages/ide/src/lib/compiler-config.ts packages/ide/src/lib/compiler-config.spec.ts
git commit -m "feat: add statement terminator config surface"
```

### Task 2: Add compiler validation for the custom terminator

**Files:**
- Modify: `packages/compiler/src/lexer/config.ts`
- Test: `packages/compiler/src/tests/lexer/statement-terminator-config.spec.ts`

**Step 1: Write the failing test**

Create `packages/compiler/src/tests/lexer/statement-terminator-config.spec.ts` with validation cases:

```ts
it("accepts a symbolic statement terminator lexeme", () => {
  expect(() =>
    new Lexer("int main() { print(1) !! }", {
      statementTerminatorLexeme: "!!",
      locale: "en",
    }),
  ).not.toThrow();
});

it("rejects empty or whitespace terminators", () => {
  expect(() =>
    new Lexer("int main() {}", {
      statementTerminatorLexeme: "   ",
      locale: "en",
    }),
  ).toThrow(/statement terminator/i);
});

it("rejects semicolon as a custom terminator", () => {
  expect(() =>
    new Lexer("int main() {}", {
      statementTerminatorLexeme: ";",
      locale: "en",
    }),
  ).toThrow(/statement terminator/i);
});
```

**Step 2: Run test to verify it fails**

Run: `npm test -- --run packages/compiler/src/tests/lexer/statement-terminator-config.spec.ts`

Expected: FAIL because no validation exists yet.

**Step 3: Write minimal implementation**

Add a validator in `packages/compiler/src/lexer/config.ts`:

```ts
export function normalizeStatementTerminatorLexeme(
  value: string | undefined,
): string | undefined {
  if (typeof value !== "string") return undefined;
  const normalized = value.trim();
  return normalized.length > 0 ? normalized : undefined;
}

export function validateStatementTerminatorLexeme(
  lexeme: string,
): void {
  if (lexeme.trim().length === 0) {
    throw new Error("statement terminator cannot be empty");
  }

  if (/\s/.test(lexeme)) {
    throw new Error("statement terminator cannot contain whitespace");
  }

  if (lexeme === ";") {
    throw new Error("statement terminator cannot reuse semicolon");
  }
}
```

Call the validator from the lexer initialization path after normalization. Add conservative conflict checks against fixed token starters if needed during implementation.

**Step 4: Run test to verify it passes**

Run: `npm test -- --run packages/compiler/src/tests/lexer/statement-terminator-config.spec.ts`

Expected: PASS for accepted symbolic lexeme and rejection cases.

**Step 5: Commit**

```bash
git add packages/compiler/src/lexer/config.ts packages/compiler/src/tests/lexer/statement-terminator-config.spec.ts
git commit -m "feat: validate statement terminator configuration"
```

### Task 3: Teach the lexer to emit the normal statement terminator token

**Files:**
- Modify: `packages/compiler/src/lexer/index.ts`
- Modify: `packages/compiler/src/lexer/scanners/lexer.ts`
- Modify: `packages/compiler/src/lexer/scanners/symbol-and-operator.ts`
- Modify: `packages/compiler/src/token/mappings/symbols-tokens.ts`
- Test: `packages/compiler/src/tests/lexer/statement-terminator-config.spec.ts`

**Step 1: Write the failing test**

Extend `packages/compiler/src/tests/lexer/statement-terminator-config.spec.ts`:

```ts
it("tokenizes the configured terminator as semicolon token for normal statements", () => {
  const lexer = new Lexer("int main() { print(1) !! }", {
    statementTerminatorLexeme: "!!",
    locale: "en",
  });

  const semicolonTokens = lexer
    .scanTokens()
    .filter((token) => token.type === TOKENS.SYMBOLS.semicolon);

  expect(semicolonTokens).toHaveLength(1);
  expect(semicolonTokens[0]?.lexeme).toBe("!!");
});
```

**Step 2: Run test to verify it fails**

Run: `npm test -- --run packages/compiler/src/tests/lexer/statement-terminator-config.spec.ts`

Expected: FAIL because the lexer only recognizes literal `;`.

**Step 3: Write minimal implementation**

Expose the normalized config value on the lexer instance:

```ts
public statementTerminatorLexeme?: string;
```

In `packages/compiler/src/lexer/scanners/symbol-and-operator.ts`, check for the configured lexeme before fixed symbol scanning:

```ts
const terminator = this.lexer.statementTerminatorLexeme;
if (
  terminator &&
  this.lexer.source.startsWith(terminator, this.lexer.current)
) {
  this.lexer.advanceBy(terminator.length);
  this.lexer.addToken(TOKENS.SYMBOLS.semicolon, terminator);
  return;
}
```

Keep literal `;` support in the fixed symbols map so existing syntax and `for (...)` separators still tokenize.

**Step 4: Run test to verify it passes**

Run: `npm test -- --run packages/compiler/src/tests/lexer/statement-terminator-config.spec.ts`

Expected: PASS with the configured lexeme emitted as a semicolon token.

**Step 5: Commit**

```bash
git add packages/compiler/src/lexer/index.ts packages/compiler/src/lexer/scanners/lexer.ts packages/compiler/src/lexer/scanners/symbol-and-operator.ts packages/compiler/src/token/mappings/symbols-tokens.ts packages/compiler/src/tests/lexer/statement-terminator-config.spec.ts
git commit -m "feat: lex custom statement terminators"
```

### Task 4: Make regular statement parsing reject literal `;` when custom terminator is active

**Files:**
- Modify: `packages/compiler/src/token/TokenIterator.ts`
- Modify: `packages/compiler/src/grammar/syntax/statementTerminator.ts`
- Test: `packages/compiler/src/tests/grammar/semicolon.spec.ts`

**Step 1: Write the failing test**

Add cases in `packages/compiler/src/tests/grammar/semicolon.spec.ts`:

```ts
it("rejects literal semicolon in normal statements when custom terminator is active", () => {
  expect(() =>
    compileToIr("int main() { print(1); }", {
      statementTerminatorLexeme: "!!",
    }),
  ).toThrow(/statement terminator|Unexpected token/);
});

it("accepts configured terminator in required mode", () => {
  expect(() =>
    compileToIr("int main() { print(1)!! }", {
      statementTerminatorLexeme: "!!",
      grammar: { semicolonMode: "required" },
    }),
  ).not.toThrow();
});
```

**Step 2: Run test to verify it fails**

Run: `npm test -- --run packages/compiler/src/tests/grammar/semicolon.spec.ts`

Expected: FAIL because regular statement parsing still accepts literal `;`.

**Step 3: Write minimal implementation**

Thread the configured lexeme through the parser-visible config on `TokenIterator`:

```ts
type TokenIteratorConfig = {
  locale?: string;
  grammar?: { semicolonMode?: "optional-eol" | "required"; ... };
  statementTerminatorLexeme?: string;
};
```

Add helper logic in `packages/compiler/src/grammar/syntax/statementTerminator.ts`:

```ts
const customTerminator = iterator.getStatementTerminatorLexeme();
const canConsumeLiteralSemicolon = !customTerminator;

if (iterator.match(TOKENS.SYMBOLS.semicolon)) {
  const token = iterator.peek();
  if (
    canConsumeLiteralSemicolon ||
    token.lexeme === customTerminator
  ) {
    iterator.consume(TOKENS.SYMBOLS.semicolon);
    return;
  }
}
```

When required and the next token is a literal `;` while a custom lexeme is configured, throw a targeted error if practical; otherwise let the normal unexpected-token path fail.

**Step 4: Run test to verify it passes**

Run: `npm test -- --run packages/compiler/src/tests/grammar/semicolon.spec.ts`

Expected: PASS for required-mode custom terminator acceptance and literal-semicolon rejection in normal statements.

**Step 5: Commit**

```bash
git add packages/compiler/src/token/TokenIterator.ts packages/compiler/src/grammar/syntax/statementTerminator.ts packages/compiler/src/tests/grammar/semicolon.spec.ts
git commit -m "feat: parse custom statement terminators"
```

### Task 5: Preserve `for (...)` semicolons as literal separators

**Files:**
- Modify: `packages/compiler/src/grammar/syntax/forStmt.ts`
- Test: `packages/compiler/src/tests/grammar/semicolon.spec.ts`

**Step 1: Write the failing test**

Add `for (...)` coverage in `packages/compiler/src/tests/grammar/semicolon.spec.ts`:

```ts
it("keeps literal semicolons inside for headers when custom terminator is active", () => {
  expect(() =>
    compileToIr(
      "int main() { for (int i = 0; i < 3; i++) { print(i)!! } }",
      {
        statementTerminatorLexeme: "!!",
      },
    ),
  ).not.toThrow();
});

it("rejects custom terminator inside for headers", () => {
  expect(() =>
    compileToIr(
      "int main() { for (int i = 0!! i < 3!! i++) { print(i)!! } }",
      {
        statementTerminatorLexeme: "!!",
      },
    ),
  ).toThrow(/Unexpected token/);
});
```

**Step 2: Run test to verify it fails**

Run: `npm test -- --run packages/compiler/src/tests/grammar/semicolon.spec.ts`

Expected: FAIL until `for (...)` parsing explicitly relies on literal-semicolon lexemes.

**Step 3: Write minimal implementation**

If needed, tighten `packages/compiler/src/grammar/syntax/forStmt.ts` to validate the consumed semicolon token lexeme:

```ts
const token = iterator.peek();
if (token.type !== semicolon || token.lexeme !== ";") {
  iterator.throwUnexpectedToken(token);
}
iterator.consume(semicolon);
```

Apply that check for both separator positions in the `for (...)` header only.

**Step 4: Run test to verify it passes**

Run: `npm test -- --run packages/compiler/src/tests/grammar/semicolon.spec.ts`

Expected: PASS for literal `;` in `for (...)` and rejection of the custom terminator there.

**Step 5: Commit**

```bash
git add packages/compiler/src/grammar/syntax/forStmt.ts packages/compiler/src/tests/grammar/semicolon.spec.ts
git commit -m "fix: keep for headers on literal semicolons"
```

### Task 6: Surface the new customization in IDE state and validation

**Files:**
- Modify: `packages/ide/src/contexts/KeywordContext.tsx`
- Modify: `packages/ide/src/components/keyword-customizer.tsx`
- Modify: `packages/ide/src/lib/keyword-map.ts`
- Test: `packages/ide/src/contexts/KeywordContext.spec.ts`
- Test: `packages/ide/src/components/keyword-customizer.spec.tsx`

**Step 1: Write the failing test**

Add context-level persistence coverage in `packages/ide/src/contexts/KeywordContext.spec.ts`:

```ts
it("persists statement terminator customization", () => {
  // render provider, set customization to "!!", reload stored state
  expect(result.current.statementTerminatorLexeme).toBe("!!");
});
```

Add UI validation coverage in `packages/ide/src/components/keyword-customizer.spec.tsx`:

```tsx
it("blocks whitespace in statement terminator customization", async () => {
  // enter "two words" and assert validation message
});
```

**Step 2: Run test to verify it fails**

Run: `npm test -- --run packages/ide/src/contexts/KeywordContext.spec.ts packages/ide/src/components/keyword-customizer.spec.tsx`

Expected: FAIL because the new field does not exist in state, storage, or UI.

**Step 3: Write minimal implementation**

Add state to `KeywordContext`:

```ts
const [statementTerminatorLexeme, setStatementTerminatorLexeme] =
  useState<string>("");
```

Include it in:

- stored customization schema
- reset/default loading
- `buildLexerConfig()`
- validation helpers

Validation should require:

```ts
if (!value.trim()) return "Informe um terminador.";
if (/\s/.test(value)) return "O terminador não pode conter espaços.";
if (value.trim() === ";") return "Escolha um terminador diferente de ;.";
```

Expose an input in `packages/ide/src/components/keyword-customizer.tsx` near grammar settings so users can set the custom terminator without mixing it into keyword/operator maps.

**Step 4: Run test to verify it passes**

Run: `npm test -- --run packages/ide/src/contexts/KeywordContext.spec.ts packages/ide/src/components/keyword-customizer.spec.tsx`

Expected: PASS for persistence and validation behavior.

**Step 5: Commit**

```bash
git add packages/ide/src/contexts/KeywordContext.tsx packages/ide/src/components/keyword-customizer.tsx packages/ide/src/lib/keyword-map.ts packages/ide/src/contexts/KeywordContext.spec.ts packages/ide/src/components/keyword-customizer.spec.tsx
git commit -m "feat: add IDE statement terminator customization"
```

### Task 7: Propagate the config through IDE compiler integration

**Files:**
- Modify: `packages/ide/src/lib/local-api.ts`
- Modify: `packages/ide/src/use-cases/compiler/run-lexer.ts`
- Modify: `packages/ide/src/use-cases/compiler/run-intermediator.ts`
- Modify: `packages/ide/src/tests/integration/hooks/use-lexer-analyse.spec.ts`
- Modify: `packages/ide/src/tests/integration/hooks/use-intermediator-code.spec.ts`
- Test: `packages/ide/src/pages/api/__tests__/submission-config.spec.ts`

**Step 1: Write the failing test**

Add a config propagation assertion in `packages/ide/src/pages/api/__tests__/submission-config.spec.ts`:

```ts
expect(body.statementTerminatorLexeme).toBe("!!");
```

Add hook-level integration coverage so lexer and intermediator requests forward the field unchanged.

**Step 2: Run test to verify it fails**

Run: `npm test -- --run packages/ide/src/pages/api/__tests__/submission-config.spec.ts packages/ide/src/tests/integration/hooks/use-lexer-analyse.spec.ts packages/ide/src/tests/integration/hooks/use-intermediator-code.spec.ts`

Expected: FAIL because the new field is not forwarded through all compiler request paths.

**Step 3: Write minimal implementation**

Include `statementTerminatorLexeme` anywhere compiler config payloads are serialized or forwarded:

```ts
const payload = normalizeCompilerConfig(input);
return {
  ...payload,
  statementTerminatorLexeme: payload.statementTerminatorLexeme,
};
```

Ensure both lexer-analysis and intermediate-code execution paths send identical config shape.

**Step 4: Run test to verify it passes**

Run: `npm test -- --run packages/ide/src/pages/api/__tests__/submission-config.spec.ts packages/ide/src/tests/integration/hooks/use-lexer-analyse.spec.ts packages/ide/src/tests/integration/hooks/use-intermediator-code.spec.ts`

Expected: PASS with the new field visible end-to-end in IDE compiler requests.

**Step 5: Commit**

```bash
git add packages/ide/src/lib/local-api.ts packages/ide/src/use-cases/compiler/run-lexer.ts packages/ide/src/use-cases/compiler/run-intermediator.ts packages/ide/src/pages/api/__tests__/submission-config.spec.ts packages/ide/src/tests/integration/hooks/use-lexer-analyse.spec.ts packages/ide/src/tests/integration/hooks/use-intermediator-code.spec.ts
git commit -m "feat: propagate statement terminator config"
```

### Task 8: Update messages and token labels

**Files:**
- Modify: `packages/compiler/src/i18n/locales/en/token.ts`
- Modify: `packages/compiler/src/i18n/locales/pt-BR/token.ts`
- Modify: `packages/compiler/src/i18n/locales/pt-PT/token.ts`
- Modify: `packages/compiler/src/i18n/locales/es/token.ts`
- Modify: `packages/compiler/src/i18n/locales/en/grammar.ts`
- Modify: `packages/compiler/src/i18n/locales/pt-BR/grammar.ts`
- Modify: `packages/compiler/src/i18n/locales/pt-PT/grammar.ts`
- Modify: `packages/compiler/src/i18n/locales/es/grammar.ts`

**Step 1: Write the failing test**

Add or extend an assertion in an existing grammar/issue spec so the error message for missing configured terminator includes the configured lexeme, for example:

```ts
expect(error.message).toContain("!!");
```

Use the nearest existing grammar error test file if there is already issue-message coverage.

**Step 2: Run test to verify it fails**

Run: `npm test -- --run packages/compiler/src/tests/grammar/semicolon.spec.ts`

Expected: FAIL because messages still refer to semicolon generically.

**Step 3: Write minimal implementation**

Update token display names to avoid hardcoding only `;` when a custom terminator is configured. If message templating supports context, inject the configured lexeme into statement-terminator expectations. If the system cannot fully parameterize token names cleanly, at minimum add a targeted parser/config error that mentions the configured lexeme.

**Step 4: Run test to verify it passes**

Run: `npm test -- --run packages/compiler/src/tests/grammar/semicolon.spec.ts`

Expected: PASS with user-facing errors mentioning the configured terminator where applicable.

**Step 5: Commit**

```bash
git add packages/compiler/src/i18n/locales/en/token.ts packages/compiler/src/i18n/locales/pt-BR/token.ts packages/compiler/src/i18n/locales/pt-PT/token.ts packages/compiler/src/i18n/locales/es/token.ts packages/compiler/src/i18n/locales/en/grammar.ts packages/compiler/src/i18n/locales/pt-BR/grammar.ts packages/compiler/src/i18n/locales/pt-PT/grammar.ts packages/compiler/src/i18n/locales/es/grammar.ts packages/compiler/src/tests/grammar/semicolon.spec.ts
git commit -m "fix: clarify custom terminator diagnostics"
```

### Task 9: Run focused verification and document any residual risk

**Files:**
- Modify: `docs/plans/2026-03-24-statement-terminator-customization-implementation.md`

**Step 1: Run focused compiler tests**

Run:

```bash
npm test -- --run packages/compiler/src/tests/lexer/statement-terminator-config.spec.ts
npm test -- --run packages/compiler/src/tests/grammar/semicolon.spec.ts
```

Expected: PASS

**Step 2: Run focused IDE tests**

Run:

```bash
npm test -- --run packages/ide/src/lib/compiler-config.spec.ts
npm test -- --run packages/ide/src/contexts/KeywordContext.spec.ts
npm test -- --run packages/ide/src/components/keyword-customizer.spec.tsx
npm test -- --run packages/ide/src/pages/api/__tests__/submission-config.spec.ts
npm test -- --run packages/ide/src/tests/integration/hooks/use-lexer-analyse.spec.ts
npm test -- --run packages/ide/src/tests/integration/hooks/use-intermediator-code.spec.ts
```

Expected: PASS

**Step 3: Run broader sanity suite**

Run:

```bash
npm test -- --run packages/compiler/src/tests/grammar/block-delimiters.spec.ts
npm test -- --run packages/compiler/src/tests/lexer/operator-word-aliases.spec.ts
```

Expected: PASS to confirm neighboring customization systems were not regressed.

**Step 4: Record verification notes**

Append a short verification section to this plan file with:

- exact commands run
- pass/fail status
- any deferred risks such as unresolved overlapping-symbol edge cases

**Step 5: Commit**

```bash
git add docs/plans/2026-03-24-statement-terminator-customization-implementation.md
git commit -m "docs: record statement terminator verification"
```

## Verification Notes

- `packages/compiler`: `npx vitest run src/tests/lexer/statement-terminator-config.spec.ts src/tests/grammar/semicolon.spec.ts`
  Status: PASS (`29 passed`)
- `packages/compiler`: `npx vitest run src/tests/lexer/block-delimiters.spec.ts src/tests/lexer/operator-word-aliases.spec.ts`
  Status: PASS (`11 passed`)
- `packages/ide`: `npx vitest run src/contexts/KeywordContext.spec.ts src/components/keyword-customizer.spec.tsx src/tests/integration/hooks/use-lexer-analyse.spec.ts src/tests/integration/hooks/use-intermediator-code.spec.ts src/pages/api/__tests__/submission-config.spec.ts`
  Status: PASS (`19 passed`)

## Residual Risk

- The current validation intentionally rejects any custom terminator that reuses fixed operator or structural characters. This avoids lexer ambiguity now, but it is stricter than the long-term direction of allowing a broader symbolic vocabulary.
- No Monaco/editor highlighting was added for statement terminators because they are emitted as the existing semicolon token and there is no separate editor-facing token family for them today.
