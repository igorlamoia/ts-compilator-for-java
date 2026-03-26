# Statement Terminator Customization Design

## Context

The project already supports configuration for grammar behavior such as `semicolonMode`, `blockMode`, `typingMode`, and `arrayMode`, plus customizable lexer-driven aliases for keywords, operator words, boolean literals, and block delimiters.

Today, statement termination is split across two concerns:

- `semicolonMode` controls whether a statement terminator is required or whether end-of-line is enough.
- The actual terminator lexeme is hardcoded as `;` in the lexer and parser.

The requested change is to keep the current required-vs-optional behavior, but allow users to replace the statement terminator with a custom lexeme. When a custom terminator is configured, normal statements must accept only that configured terminator. The literal `;` must remain reserved for `for (...)` headers and must no longer terminate regular statements.

## Goals

- Add a dedicated configuration for the statement terminator lexeme.
- Preserve the existing `semicolonMode` behavior unchanged.
- Keep `;` mandatory inside `for (...)` headers regardless of customization.
- Reject `;` as a normal statement terminator when a custom terminator is active.
- Support custom terminators made of non-space characters, including special symbols, as long as they do not conflict with fixed lexer tokens.

## Non-Goals

- Do not support spaces inside the custom terminator in this first version.
- Do not change the `for (...)` grammar to use the custom terminator.
- Do not redesign other custom keyword/operator systems to support arbitrary symbol sequences yet.

## Options Considered

### Option 1: Dedicated statement terminator config

Add a separate configuration field such as `statementTerminatorLexeme?: string`, propagate it through IDE state and compiler payloads, teach the lexer to recognize the configured lexeme for normal statements, and keep `for (...)` consuming literal `;`.

Pros:

- Matches the requested behavior directly.
- Keeps `semicolonMode` focused on required-vs-optional semantics.
- Avoids overloading the meaning of "semicolon" with arbitrary text.
- Leaves room for future expansion.

Cons:

- Touches multiple layers: IDE state, compiler config, lexer, parser, and tests.

### Option 2: Reuse the semicolon concept with a custom lexeme

Treat the semicolon token as configurable everywhere except special parser cases such as `for (...)`.

Pros:

- Smaller naming surface.

Cons:

- Conceptually misleading once the terminator is no longer semicolon-like.
- Creates avoidable ambiguity because `for (...)` still requires a literal `;`.

### Option 3: Preprocess source text before lexing

Translate the configured terminator into `;` before normal lexing/parsing.

Pros:

- Superficially small implementation.

Cons:

- Fragile for diagnostics, token positions, syntax highlighting, and future extensibility.
- Harder to make safe with symbolic lexemes.

## Chosen Approach

Choose Option 1: add a dedicated statement terminator configuration independent from `semicolonMode`.

This keeps the mental model clean:

- `semicolonMode` answers whether the statement terminator is required.
- `statementTerminatorLexeme` answers what lexeme ends a normal statement.

`for (...)` remains a separate grammatical construct that always uses literal `;`.

## Configuration Model

Add a new optional compiler/IDE payload field:

```ts
type StatementTerminatorConfig = {
  statementTerminatorLexeme?: string;
};
```

Expected behavior:

- If `statementTerminatorLexeme` is absent, the default normal-statement terminator remains `;`.
- If it is present, normal statements accept only the configured lexeme.
- `semicolonMode: "required"` still requires a terminator at statement boundaries.
- `semicolonMode: "optional-eol"` still allows line breaks to terminate statements.
- `for (...)` always keeps literal `;` separators.

## Compiler Architecture

### Lexer

The custom terminator must not be recognized through the identifier scanner because it may contain special symbols. The lexer should instead treat it as a configured raw lexeme with explicit matching priority.

Design constraints:

- Reject empty values after trimming.
- Reject values containing whitespace in this first version.
- Reject lexemes that collide with fixed symbols or operators in ways that would make tokenization ambiguous.
- Reject `;` as a configured custom value to avoid redundant and confusing configuration.

Recommended lexer behavior:

- Keep literal `;` tokenization available for structural grammar that still depends on it.
- Add configured matching so normal statement termination can recognize the custom lexeme.
- Ensure the configured lexeme is checked with deterministic precedence against existing symbol/operator scanners.

### Parser

`consumeStmtTerminator` should stop assuming that the normal statement terminator is always literal `;`. Instead, it should consume a parser-visible token or token condition that represents the configured normal statement terminator.

`forStmt` should remain unchanged in intent:

- initializer separator: literal `;`
- condition separator: literal `;`

That separation is important so the custom terminator does not leak into `for (...)`.

## IDE Architecture

The IDE already persists and sends compiler customization state. The new terminator config should follow the same pipeline:

- customization state in `KeywordContext`
- local persistence under the existing customization storage
- normalization in compiler config helpers
- UI entry in the keyword/customization dialog
- propagation into API payloads used by lexer/intermediate analysis flows

This should be modeled as a dedicated field, not folded into keyword maps or operator maps.

## Validation Rules

For the first version, validation should enforce:

- value cannot be empty after trim
- value cannot contain spaces or other whitespace
- value cannot be `;`
- value cannot collide with fixed structural tokens or operators
- value should be rejected if it creates lexer ambiguity with existing fixed tokens

Deliberately not required in this version:

- identifier-like restriction
- support for spaces

## Error Handling

Errors should describe the configured terminator, not generic semicolon wording, when the parser is expecting a normal statement terminator.

Required cases:

- missing configured terminator in `required` mode
- using `;` for a normal statement when a custom terminator is configured
- using the custom terminator inside `for (...)` headers instead of literal `;`
- invalid configuration values rejected before compilation proceeds

## Testing Strategy

### Compiler tests

Add grammar and lexer coverage for:

- default behavior with no custom terminator remains unchanged
- custom terminator accepted for declarations, assignments, calls, `print`, `scan`, `return`, `break`, and `continue`
- `semicolonMode: "required"` still enforces the configured terminator
- `semicolonMode: "optional-eol"` still allows end-of-line termination
- `;` is rejected for regular statements when customization is active
- `for (...)` still requires literal `;`
- custom symbolic terminators without whitespace are accepted when non-conflicting
- conflicting custom terminators are rejected by configuration validation

### IDE tests

Add coverage for:

- state persistence and restoration of the new field
- payload normalization including the new field
- customizer validation and save behavior
- integration flows that send compiler config to lexer/intermediate endpoints

## Risks

- Lexer precedence bugs if the custom terminator overlaps with existing fixed symbols.
- Diagnostics could remain semicolon-specific unless token descriptions/messages are updated carefully.
- UI validation must be strict enough to prevent invalid lexemes from reaching compiler internals.

## Success Criteria

- Users can configure a non-whitespace custom terminator for normal statements.
- `semicolonMode` continues to work exactly as before.
- `for (...)` headers continue to require literal `;`.
- Existing code paths without custom configuration are unaffected.
