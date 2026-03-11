# Design: Operator Word Customization

## Context
The project already supports customizable reserved words such as `if`, `while`, `print`, and type declarations through the IDE keyword customizer, persisted IDE state, API payloads, and compiler lexer configuration. Logical and relational operators are still hardcoded as symbol-only forms in the compiler and editor, which prevents users from defining readable word aliases such as `and`, `or`, `not`, `less_equal`, or `greater`.

Goal: add customizable word aliases for logical and relational operators while preserving the existing symbolic operators and keeping parser/runtime behavior stable.

## Goals
- Support custom word aliases for logical operators: `logical_or`, `logical_and`, `logical_not`.
- Support custom word aliases for relational operators: `less`, `less_equal`, `greater`, `greater_equal`, `equal`, `not_equal`.
- Keep built-in symbol operators valid at all times: `||`, `&&`, `!`, `<`, `<=`, `>`, `>=`, `==`, `!=`.
- Propagate the new configuration through IDE state, customizer UI, API payloads, and compiler lexer config.
- Reuse the existing token IDs so grammar, parser, semantic logic, and IR remain compatible.
- Validate collisions against customized keywords, block delimiters, and other operator aliases.

## Non-Goals
- No removal or replacement of symbolic operators.
- No parser grammar rewrite for word-only operator syntax.
- No arithmetic operator customization in this change.
- No snippet redesign beyond what is needed for correct language/editor registration.

## Selected Approach
Chosen approach: add a dedicated `operatorWordMap` configuration alongside the existing keyword map.

Reasoning:
- Keeps keywords and operator aliases as separate concepts with clearer UI and API semantics.
- Allows the lexer to accept both symbols and word aliases without changing downstream parser logic.
- Minimizes risk by concentrating the change in validation, lexer config, IDE state, and Monaco registration.

## Configuration Model

### Operator Word Map
Add a dedicated optional payload:

```ts
type OperatorWordMap = {
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

### Defaults
Default aliases should be the readable words requested by the user:
- `logical_or`: `or`
- `logical_and`: `and`
- `logical_not`: `not`
- `less`: `less`
- `less_equal`: `less_equal`
- `greater`: `greater`
- `greater_equal`: `greater_equal`
- `equal`: `equal`
- `not_equal`: `not_equal`

These defaults are additive aliases, not replacements for symbolic operators.

## Language Semantics

### Additive Operator Aliases
Both symbol and word forms must emit the same token IDs.

Examples:
- `a && b` and `a and b` both produce `logical_and`
- `!a` and `not a` both produce `logical_not`
- `a <= b` and `a less_equal b` both produce `less_equal`

### Parser Stability
No grammar production changes are required as long as the lexer maps alias words to the existing logical and relational token IDs.

## Compiler Architecture Changes (`packages/compiler`)

### Lexer Config
Extend lexer config to accept `operatorWordMap` in addition to `customKeywords`, block delimiters, locale, and indentation settings.

### Validation
Each alias must:
- be identifier-like
- be unique among operator aliases
- not collide with customized keywords
- not collide with block delimiters
- not reuse reserved words in a way that creates ambiguous scanning

If invalid configuration reaches the compiler, the lexer should throw a clear configuration error.

### Effective Reserved Lookup
Build an effective reserved-word map from:
- built-in reserved keywords
- customized keyword overrides
- operator word aliases

Identifier scanning should consult this merged map so alias words emit the same token IDs as their symbolic operator equivalents.

### Symbol Scanning
Keep the existing symbol/operator scanner unchanged so current programs continue to work.

## IDE And API Changes (`packages/ide`)

### Shared Config Types
Extend compiler config payload types and normalization helpers to include `operatorWordMap`.

### Keyword Context
Store operator aliases alongside the existing keyword mappings and grammar settings:
- defaults
- load from local storage
- persist to local storage
- include in `buildLexerConfig`
- restore on reset

### Customizer UI
Add a dedicated section for logical and relational operator aliases in the customizer modal.

Each field should:
- represent one operator slot
- accept identifier-style values only
- show inline validation errors
- participate in save blocking when invalid

### API Endpoints
Lexer-related endpoints must accept and pass `operatorWordMap` into compiler lexer construction.

## Editor / Monaco Changes

### Language Registration
The Monaco language metadata should include configured operator words so they are classified consistently in the editor.

### Highlighting
Configured operator words should render as operator or reserved syntax rather than plain identifiers. Dynamic language re-registration must react to operator alias changes the same way it already reacts to keyword customization.

### Snippets And Completion
Only update snippets or completion data if they intentionally surface logical/relational operators in generated code. Otherwise leave snippet bodies unchanged to avoid unnecessary churn.

## Error Handling
- Invalid alias format: block save in UI and reject in compiler validation if reached there.
- Duplicate operator aliases: block save and indicate the conflicting field.
- Alias conflicts with customized keywords or block delimiters: block save and show a targeted message.
- Missing values after reset/default load: repopulate defaults rather than allowing partial invalid config.

## Testing Strategy

### Compiler Tests
Add tests covering:
- logical aliases tokenize to the same IDs as `||`, `&&`, `!`
- relational aliases tokenize to the same IDs as `<`, `<=`, `>`, `>=`, `==`, `!=`
- symbolic operators still work when aliases are configured
- invalid alias collisions raise configuration errors

### IDE / API Tests
Add or update tests covering:
- config normalization includes `operatorWordMap`
- API handlers forward `operatorWordMap` to the lexer
- context persistence and reset include operator aliases

### Editor Tests
Add tests ensuring:
- Monaco metadata includes operator alias words
- alias changes trigger updated language registration/highlighting behavior

## Success Criteria
- Users can configure readable word aliases for the 3 logical and 6 relational operators.
- Symbol operators remain valid and unchanged.
- Alias words are accepted end-to-end by IDE, API, and compiler.
- Invalid alias combinations are rejected before persistence and also guarded in the compiler.
- Existing parser and runtime behavior remain unchanged because token IDs stay the same.
