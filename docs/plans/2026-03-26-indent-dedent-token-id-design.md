# Indent Dedent Token ID Design

## Context

The compiler currently assigns the same numeric token IDs to indentation structural symbols and reserved words:

- `indent` and `dedent` in `packages/compiler/src/token/constants/symbols.ts`
- `bool` and `true` in `packages/compiler/src/token/constants/reserveds.ts`

This creates an ambiguous token identity at the compiler level. Any consumer that classifies or labels tokens from the numeric `type` alone can misidentify `<INDENT>` as `bool` and `<DEDENT>` as another reserved token.

The IDE exposed this ambiguity, but the root cause is not in the IDE. The compiler token constants themselves are colliding.

## Goals

- Give `indent` and `dedent` unique numeric token IDs in the compiler.
- Make `TOKENS.BY_ID` resolve indentation tokens unambiguously.
- Let downstream consumers such as the IDE classify indentation tokens correctly from compiler output alone.
- Keep lexer and parser semantics unchanged.

## Non-Goals

- Do not redesign the lexer token object format.
- Do not add IDE-specific metadata as the primary fix.
- Do not change indentation behavior or grammar rules.

## Options Considered

### Option 1: Renumber `indent` and `dedent`

Assign new unique IDs to `indent` and `dedent` in the compiler token constants and update tests and consumers that rely on the old numeric values.

Pros:

- Fixes the problem at the source.
- Keeps the token model simple.
- Removes ambiguity from `TOKENS.BY_ID` and all generic token consumers.

Cons:

- Requires updating tests or fixtures that compare numeric IDs directly.

### Option 2: Add explicit token-family metadata

Keep the colliding numeric IDs but attach category metadata such as `family: "SYMBOLS"` to emitted tokens.

Pros:

- Avoids renumbering existing IDs.

Cons:

- More invasive than needed.
- Pushes extra metadata through the compiler and IDE pipelines.
- Leaves the numeric ambiguity unresolved.

### Option 3: Keep compiler IDs and patch consumers individually

Let the compiler continue emitting ambiguous IDs and teach each consumer to disambiguate with lexeme-based rules.

Pros:

- Small local fixes in each affected consumer.

Cons:

- The source of truth remains wrong.
- Encourages duplicate fallback logic across the codebase.

## Chosen Approach

Choose Option 1: renumber `indent` and `dedent`.

The compiler should emit unambiguous token identities. Consumers should not need special knowledge to interpret core structural tokens correctly.

## Architecture

### Compiler Token Constants

Update `packages/compiler/src/token/constants/symbols.ts` so `indent` and `dedent` use unique IDs that do not overlap any reserved, literal, or operator token IDs.

This change must remain coordinated with:

- `packages/compiler/src/token/constants/index.ts`
- any tests or code paths that compare token IDs directly
- IDE code that currently assumes the old colliding IDs

### Lexer

The lexer in `packages/compiler/src/lexer/index.ts` should remain behaviorally unchanged. It should continue emitting `TOKENS.SYMBOLS.indent` and `TOKENS.SYMBOLS.dedent`, but those constants will now resolve to unique IDs.

### IDE and Consumers

After the compiler IDs are unique, consumers such as the IDE can classify tokens by numeric `type` without extra lexeme-based disambiguation.

Any temporary IDE workaround introduced only because of the collision should be removed or reduced once the compiler-side fix is verified.

## Migration Impact

This change is an internal compatibility break for numeric token IDs only.

Expected fallout:

- compiler tests that assert raw token IDs may need updates
- IDE tests or mappings that assume the old numbers may need updates
- any code relying on `55/56` specifically for indentation tokens must be aligned with the new constants

There is no intended source-language behavior change beyond correct token identity.

## Testing Strategy

Add or update coverage for:

- lexer indentation tokens use the new unique IDs
- `TOKENS.BY_ID` resolves `indent` and `dedent` correctly
- IDE token classification no longer depends on collision workarounds
- token labels for indentation tokens resolve from compiler output correctly

Verification should include both compiler and IDE-focused tests because the bug crosses package boundaries.

## Risks

- Hardcoded numeric IDs in tests or mappings may fail after renumbering.
- Partial migration could leave the compiler fixed but the IDE still carrying obsolete assumptions.

## Success Criteria

- `indent` and `dedent` have unique token IDs in the compiler.
- `TOKENS.BY_ID` maps those IDs to `indent` and `dedent` correctly.
- `<INDENT>` is no longer interpreted as `bool (55)` by downstream consumers.
- IDE token displays work correctly from compiler token data without requiring token-type collision hacks.
