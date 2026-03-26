# Indent Dedent IDE Design

## Context

The IDE currently displays indentation-mode structural tokens incorrectly in the token views.

Two visible symptoms were identified:

- `INDENT` is classified visually as `bool (55)` instead of a symbol token
- `DEDENT` can appear as `token.dedent` in the interface instead of a translated label

The root cause is an ID collision in the compiler token constants:

- `indent` and `dedent` use the same numeric IDs as reserved words such as `bool` and `true`
- the IDE currently relies on generic numeric lookup and generic classification order

That makes the UI choose the wrong token family and, in some paths, the wrong translation key.

## Goals

- Fix `INDENT` visual classification in the IDE token views.
- Fix translated display names for both `INDENT` and `DEDENT`.
- Keep the change scoped to the IDE/UI layer.
- Preserve the current compiler token IDs for now.

## Non-Goals

- Do not renumber compiler token IDs in this change.
- Do not redesign the compiler token constant system.
- Do not change lexer behavior or emitted lexemes.

## Options Considered

### Option 1: IDE-only explicit handling

Add explicit handling in the IDE for structural indentation tokens based on `type + lexeme`, bypassing ambiguous numeric lookups when the lexeme is `<INDENT>` or `<DEDENT>`.

Pros:

- Smallest and safest change.
- Fixes the current UI bug directly.
- Avoids touching compiler-wide token numbering.

Cons:

- Leaves the underlying ID collision in place.

### Option 2: Renumber compiler token IDs

Assign unique IDs to `indent` and `dedent` so all generic lookup paths become reliable.

Pros:

- Cleaner model long term.

Cons:

- Higher regression risk.
- Touches compiler and IDE assumptions beyond the requested bug.

### Option 3: Hybrid

Fix the UI now and plan a later cleanup of token IDs.

Pros:

- Pragmatic short term and clean long term.

Cons:

- Leaves deferred cleanup work.

## Chosen Approach

Choose Option 1: IDE-only explicit handling.

The issue is currently user-visible only in the IDE token presentation layer, so the most pragmatic change is to override the ambiguous generic lookup there.

## Architecture

### Classification

Update the IDE classifier in `packages/ide/src/utils/compiler/classification.ts` so structural indentation lexemes are classified as `SYMBOLS` before generic numeric-family lookup runs.

Expected behavior:

- `token.lexeme === "<INDENT>"` -> `SYMBOLS`
- `token.lexeme === "<DEDENT>"` -> `SYMBOLS`

This ensures the visual grouping and style match symbol tokens instead of colliding reserved-word IDs.

### Token Label Translation

Update the token label path in `packages/ide/src/components/token-card.tsx` so indentation structural tokens use explicit token keys:

- `<INDENT>` -> `indent`
- `<DEDENT>` -> `dedent`

This bypasses ambiguous `TOKENS.BY_ID[token.type]` lookup for these two cases and guarantees the existing translations are used in all supported locales.

### Existing Translations

The compiler token locale files already define `indent` and `dedent` labels, so this change should reuse those keys rather than inventing new UI-specific text.

## Error Handling

No new runtime error handling is needed.

If a token is not one of the explicit indentation lexemes, the IDE should continue using the existing generic lookup path.

## Testing Strategy

Add IDE-side coverage for:

- classifying `<INDENT>` as `SYMBOLS`
- classifying `<DEDENT>` as `SYMBOLS`
- rendering translated labels for both indentation tokens in at least one locale-sensitive component path

Prefer focused unit tests around the classifier and token card rendering rather than broad integration changes.

## Risks

- Other token-rendering paths might still rely on numeric ID lookup if they are separate from the token card path.
- A future compiler-side token cleanup could make the explicit IDE override redundant, so the code should stay small and obvious.

## Success Criteria

- `INDENT` is no longer shown as `bool (55)` in token displays.
- `DEDENT` is shown with a translated label instead of `token.dedent`.
- Both tokens are visually grouped and styled as symbol tokens in the IDE.
