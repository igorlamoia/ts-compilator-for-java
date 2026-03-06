# Indentation-Sensitive Blocks Design

Date: 2026-03-06  
Package: `packages/compiler`  
Status: Approved

## Goal
Add an opt-in Python-like indentation block mode to the compiler.

- When `indentationBlock: true`: block structure is strictly indentation-based and requires `:` at block headers.
- When `indentationBlock: false` or omitted: keep current delimiter-based behavior unchanged (`{}` and optional configured `begin/end`).

## Constraints And Decisions

1. Block mode in indentation mode is strict: no `{}`, `begin`, or `end` accepted.
2. Indentation consistency is based on normalized depth where `tabWidth = 4` by default.
3. Mixed tabs/spaces are allowed only when resulting depth is consistent with prior indent levels.
4. Line continuation follows Python behavior:
- implicit continuation inside grouping delimiters (`()`, `[]`, `{}`)
- explicit continuation with trailing `\`
5. Semicolon handling remains independent and unchanged (`optional-eol` vs `required`).

## Approach Chosen
Implement structural whitespace in the lexer (`NEWLINE`, `INDENT`, `DEDENT`) and make parser block rules consume these tokens in indentation mode.

Reason: tokenized structure scales correctly for nested blocks and reduces parser ambiguity compared to parser-only line checks.

## Config Surface

### Lexer
Extend `LexerConfig` with:

- `indentationBlock?: boolean`
- `tabWidth?: number` (default `4`)

### Grammar/Iterator
Extend grammar config with explicit block mode:

- `blockMode?: "delimited" | "indentation"`

Wiring:

- `indentationBlock: true` => `blockMode: "indentation"`
- otherwise => `blockMode: "delimited"`

## Syntax Contract In Indentation Mode

Block headers must end with `:` and be followed by newline + increased indent.

Applies to:

- function declarations
- `if` / `else`
- `while`
- `for (...)`
- `switch`, `case`, `default` (if switch participates in indentation mode)

Block termination occurs via dedent to a previous indentation level.

## Lexer Design

When `indentationBlock` is enabled:

1. Maintain `indentStack` starting at `[0]`.
2. Maintain grouping depth counter to suppress structural newline handling inside grouped expressions.
3. On each physical newline outside grouping:
- compute next logical line indentation depth
- emit `NEWLINE` for non-empty logical lines
- compare depth with stack top:
  - greater => push + emit `INDENT`
  - equal => no indent token
  - lower => pop + emit one or more `DEDENT`; error if depth not found
4. Skip blank lines and comment-only lines for indentation transitions.
5. On EOF, flush remaining `DEDENT` until stack returns to zero.
6. Reject delimiter-based block tokens (`{`, `}`, configured `begin/end`) in indentation mode.

When disabled, lexer behavior remains exactly as today.

## Parser Design

1. Add mode-aware block helpers:
- delimited mode: current `{ ... }`
- indentation mode: `:` `NEWLINE` `INDENT` ... `DEDENT`
2. Update block entry sites (`functionCall`, `if/else`, `while`, `for`, and switch path if included) to use the helper.
3. Keep statement terminator config behavior unchanged:
- `required` still enforces `;`
- `optional-eol` still allows newline termination
4. Prefer token-based logical line handling in indentation mode, instead of line-number heuristics.

## Error Handling

New lexer error cases:

- inconsistent indentation depth
- illegal dedent target
- unexpected indent
- invalid tab/space mix resulting in non-matching depth
- delimiter-based block symbols in indentation mode

New parser error cases:

- missing `:` after block header
- missing newline + indent after `:`
- missing dedent to close a block

All new errors should be localized via existing i18n namespaces.

## Testing Strategy

### Lexer tests

- correct `NEWLINE/INDENT/DEDENT` token streams for nested blocks
- continuation inside grouping and explicit `\` continuation
- blank/comment line handling
- mixed tabs/spaces normalization with `tabWidth = 4`
- EOF dedent flush

### Grammar tests

- happy paths for indentation-mode function/if-else/while/for blocks
- strict rejection of `{}` and `begin/end` in indentation mode
- missing colon/newline/indent/dedent failures
- semicolon mode interactions remain unchanged

### Regression tests

- existing delimited-mode suite remains green when `indentationBlock` is false or omitted

## Compatibility And Rollout

- Feature is opt-in only.
- Existing users keep current syntax by default.
- No behavior changes expected unless indentation mode is enabled.
