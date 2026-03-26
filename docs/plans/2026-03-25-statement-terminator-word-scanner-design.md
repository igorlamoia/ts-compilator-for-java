# Statement Terminator Word Scanner Design

**Goal:** Support `statementTerminatorLexeme` values that are identifier-like words such as `uai` and `_uai`, while keeping symbolic terminators working, preserving literal `;` inside `for (...)`, and highlighting only `;` plus the configured custom terminator in the IDE.

## Context

The project already supports a configurable `statementTerminatorLexeme`, but the current lexer flow only reliably handles symbolic values such as `@@`.

When the configured terminator starts with a letter or `_`, the lexer currently routes the input into `IdentifierScanner` first. That causes values like `uai` to be tokenized as identifiers instead of as the parser-visible semicolon token, which then produces parser errors such as:

- expected configured statement terminator
- received identifier with lexeme `uai`

The Monaco language registration also still colors `[;,.]` as a generic delimiter, which means:

- `,` and `.` are colored even though they should not be part of this change
- a custom terminator lexeme is not colored consistently with `;`

## Requirements

- Accept identifier-like custom terminators such as `uai` and `_uai`
- Keep symbolic custom terminators such as `@@` working
- Treat the custom terminator as a normal statement terminator only when it matches as a complete lexeme
- Require users to separate word-like terminators with whitespace manually; whitespace is not part of the terminator lexeme itself
- Preserve literal `;` inside `for (...)` headers regardless of customization
- Reject conflicting custom terminators that reuse existing language words already assigned to keywords, operator aliases, boolean literals, or block delimiters
- In Monaco, color only literal `;` and the configured custom terminator with the same delimiter styling
- Stop coloring `,` and `.`

## Options Considered

### Option 1: Prioritize the configured terminator in the lexer factory and fall back to `IdentifierScanner`

Check the configured terminator before identifier dispatch. If the current source position matches the configured terminator exactly, emit `TOKENS.SYMBOLS.semicolon`; otherwise continue with identifier scanning.

Pros:

- Smallest change to the current lexer flow
- Preserves symbolic and word-like terminators

Cons:

- Keeps terminator matching logic split across factory and scanner behavior
- Makes the dispatch order harder to reason about as more dynamic lexemes are added

### Option 2: Resolve word-like terminators inside `IdentifierScanner`

Scan the identifier first, then convert it into the semicolon token if the scanned lexeme equals the configured terminator.

Pros:

- Straightforward for identifier-like terminators

Cons:

- Does not naturally cover symbolic terminators
- Mixes identifier logic with statement terminator logic
- Leaves two different matching strategies depending on lexeme shape

### Option 3: Dedicated statement terminator scanner

Create a scanner dedicated to `statementTerminatorLexeme`, with explicit matching rules for both symbolic and identifier-like values. The lexer factory gives this scanner priority when the current character can start the configured terminator.

Pros:

- Clear single place for all terminator matching rules
- Works for both symbolic and identifier-like terminators
- Keeps identifier and symbol scanners focused on their own concerns
- Makes future changes to terminator matching lower-risk

Cons:

- Slightly more code than patching the current dispatch order

## Decision

Choose Option 3: add a dedicated statement terminator scanner.

The main reason is boundary control. The scanner can own exact-match logic, including identifier boundaries for values like `uai`, without coupling that behavior to either `IdentifierScanner` or `SymbolAndOperatorScanner`.

## Design

### Compiler Lexer

Add a scanner dedicated to the configured statement terminator lexeme.

Behavior:

- If no custom terminator is configured, the dedicated scanner is inactive
- If the current source position cannot start the configured terminator, the scanner is not selected
- If the scanner is selected and the source matches the configured terminator exactly, emit `TOKENS.SYMBOLS.semicolon` using the configured lexeme text
- If the configured terminator is identifier-like, the scanner must enforce a right-side identifier boundary so `uai123` does not become `uai` + `123`
- If the scanner is selected but the source does not match exactly, lexer dispatch must continue to the normal scanner for that character class

The lexer factory should explicitly consider the dedicated terminator scanner before the identifier scanner and before the generic symbol/operator scanner, but only treat it as a match when the dedicated scanner confirms a valid full lexeme.

### Configuration Validation

`statementTerminatorLexeme` validation should continue rejecting:

- empty values
- whitespace-containing values
- `;`

In addition, word-like terminators must be rejected when they collide with already configured language words, including:

- reserved keywords or keyword overrides
- operator aliases
- boolean literal aliases
- block delimiters

This keeps a configured terminator from also being a keyword-like token class.

### Parser And Grammar

No grammar redesign is needed.

Normal statements should continue consuming the parser-visible semicolon token through `consumeStmtTerminator`.

`for (...)` should continue consuming literal `;` by lexeme and should reject the custom terminator in that context.

### Monaco Highlighting

The Monaco language configuration should accept the configured statement terminator lexeme as part of the language options.

Tokenizer behavior should change as follows:

- stop using the generic delimiter rule `[;,.]`
- color literal `;` as delimiter
- color the configured custom terminator with the same delimiter token class
- if the configured terminator is identifier-like, enforce token boundaries so Monaco does not color it inside larger identifiers
- `,` and `.` should no longer be colored by this delimiter rule

The highlighting logic should align with compiler matching semantics as closely as practical so the editor does not visually accept code the compiler rejects.

## Error Handling

Expected diagnostics behavior:

- missing required terminator still reports the configured lexeme in parser errors
- using `;` in normal statements while a custom terminator is active still fails
- using the custom terminator inside `for (...)` still fails
- invalid configuration values fail validation before compiler execution where applicable

## Testing Strategy

### Compiler lexer tests

- custom symbolic terminator still tokenizes as semicolon
- word-like terminator such as `uai` tokenizes as semicolon when separated by whitespace
- `_uai` tokenizes as semicolon
- `uai123` remains an identifier
- partial matches do not consume source incorrectly

### Grammar tests

- required mode accepts `uai`
- required mode still rejects missing configured terminator
- `for (...)` still requires literal `;`
- normal statements still reject literal `;` when custom terminator is active

### Validation tests

- reject conflicts with keyword customizations
- reject conflicts with operator aliases
- reject conflicts with boolean literal aliases
- reject conflicts with block delimiters

### IDE tests

- Monaco includes custom terminator highlighting
- Monaco highlights literal `;`
- Monaco no longer highlights `,` and `.`
- identifier-like custom terminator does not highlight inside a larger identifier

## Risks

- Compiler and Monaco boundary rules could drift apart
- Scanner priority bugs could cause incorrect fallback into identifier or symbol scanning
- Existing symbolic terminator support could regress if the new scanner is not covered by tests

## Success Criteria

- `statementTerminatorLexeme: "uai"` works when written with separating whitespace, such as `mentira uai`
- symbolic terminators such as `@@` keep working
- parser diagnostics still reference the configured terminator when required
- only `;` and the configured custom terminator are colored as statement delimiters in the IDE
