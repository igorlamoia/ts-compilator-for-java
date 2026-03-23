# Boolean Literal Customization Design

**Date:** 2026-03-22

## Goal

Allow users to customize the boolean literal words for `true` and `false` across the compiler and IDE, with those aliases flowing through validation, persistence, lexer execution, and editor highlighting.

## Scope

- Add a dedicated `booleanLiteralMap` configuration to the compiler lexer config.
- Add the same configuration to the IDE compiler payload and normalization flow.
- Expose a new "Boolean literals" section in the existing customization modal.
- Persist customized boolean literal words in `KeywordContext`.
- Update Monaco language metadata so the configured literal words are highlighted as boolean literals.
- Preserve the existing token ids for boolean literals so parser and interpreter behavior stay unchanged.

## Out Of Scope

- Converting boolean literals into regular keyword overrides.
- Creating a separate settings page outside the current customization modal.
- Changing parser, intermediate-code, or interpreter semantics for booleans.

## Recommended Approach

Add a dedicated `booleanLiteralMap` alongside `keywordMap` and `operatorWordMap`.

This keeps the data model aligned with the language semantics: reserved words remain in `keywordMap`, operator aliases remain in `operatorWordMap`, and boolean literals become a separate configurable literal mapping. It also fits the requested UX because the modal can render a dedicated "Boolean literals" section without overloading the keyword customization list.

## Alternatives Considered

### Reuse `keywordMap` for `true` and `false`

This would reduce some surface area, but it would mix literals into the keyword override system and make the editor/config behavior less coherent.

### Replace all specialized maps with a generic token-alias map

This would be more extensible, but it is broader than necessary for the current feature and would increase refactor cost across compiler and IDE flows.

## Architecture

### Compiler Config Model

Add `booleanLiteralMap?: { true?: string; false?: string }` to the lexer config in `packages/compiler`.

Compiler-side validation should enforce that configured literal aliases:

- are identifier-like words
- are non-empty after trim
- are distinct from each other
- do not collide with reserved keywords
- do not collide with customized keyword overrides
- do not collide with operator word aliases
- do not collide with custom block delimiters

After validation, lexer reserved-word resolution should recognize the configured aliases and emit the existing boolean token ids:

- `true` token id: `56`
- `false` token id: `57`

This keeps downstream grammar and interpreter logic unchanged.

### IDE Config Model

Add `booleanLiteralMap` to the IDE compiler payload types and normalization helpers in `packages/ide`.

The normalization path should:

- trim configured values
- drop empty values from inbound payloads
- preserve valid configured aliases
- fall back to defaults when persisted data is invalid or incomplete

### State And Persistence

Persist boolean literal aliases in the existing customization storage object managed by `KeywordContext`.

The stored object should continue to own:

- keyword mappings
- operator aliases
- block delimiters
- grammar settings

and should also own:

- boolean literal aliases

Default state should remain:

- `true -> "true"`
- `false -> "false"`

Reset-to-default should restore those values.

## UX Design

### Customization Modal

Keep the existing customization modal and add a dedicated "Boolean literals" section.

This section should expose two editable fields:

- `true`
- `false`

These fields should be separate from the main keyword list and should use local validation feedback consistent with the existing customization UI.

### Validation Feedback

The UI should prevent saving invalid literal aliases and show clear field-level errors when:

- a value is empty after trimming
- a value is not identifier-like
- the two literal aliases duplicate each other
- a literal alias conflicts with a keyword override
- a literal alias conflicts with an operator alias
- a literal alias conflicts with a block delimiter

## Execution Flow

`buildLexerConfig()` in the IDE should include `booleanLiteralMap` in the payload sent to:

- lexer execution
- intermediate-code generation
- submission validation

No new transport path is needed. The existing config plumbing should simply be extended to carry the new field everywhere the compiler config already flows.

## Editor Language Behavior

Monaco metadata currently treats `true` and `false` as built-in literals. That behavior should be changed so the editor derives boolean literal words from the normalized configuration instead of hardcoding them.

The configured boolean literal aliases should:

- be included in the language metadata keyword/literal set
- be highlighted consistently as language literals
- participate in completion/snippet language metadata where relevant

Old default words should no longer be highlighted as boolean literals once replaced by custom aliases.

## Error Handling

Frontend behavior should fail safe:

- invalid persisted `booleanLiteralMap` values should fall back to defaults
- reset should restore default literal words
- compiler validation should reject invalid configurations that bypass the UI

Compiler-side errors should remain explicit and configuration-focused so invalid alias combinations are easy to diagnose.

## Testing Strategy

Add or update tests for:

1. compiler config validation for valid boolean literal aliases, duplicates, and collisions
2. lexer tokenization accepting customized boolean literal words
3. lexer tokenization no longer recognizing replaced default literal words as reserved booleans
4. IDE config normalization preserving or coercing `booleanLiteralMap`
5. `KeywordContext` persistence, reset, and load behavior for boolean literal aliases
6. Monaco language metadata using configured boolean literal words instead of hardcoded defaults
7. integration hooks forwarding `booleanLiteralMap` into lexer/intermediator/submission config

## Success Criteria

- Users can customize both boolean literal words in a dedicated modal section.
- The configured literal aliases are persisted and restored correctly in the IDE.
- Compiler and IDE both validate invalid boolean literal aliases defensively.
- Lexer execution accepts the configured aliases and emits the existing boolean token ids.
- Editor highlighting follows the configured literal words rather than hardcoded `true`/`false`.
