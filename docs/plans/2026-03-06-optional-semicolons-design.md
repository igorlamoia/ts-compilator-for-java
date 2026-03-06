# Optional Semicolons Design (Compiler Grammar)

Date: 2026-03-06
Scope: `packages/compiler`
Status: Approved

## Goal
Make statement-ending semicolons optional in a JavaScript-like way, but only when omission occurs at:
- end-of-line,
- before `}`,
- or EOF.

Semicolons must remain required in grammar-critical positions, especially inside `for (...)` separators.

Additionally, support strict parser mode where semicolons are always required for statement terminators.

## Requirements
1. Default parser behavior allows omitted semicolons only at EOL / `}` / EOF.
2. Same-line multiple statements without semicolon must fail as usual.
3. `for(init; cond; inc)` separators remain mandatory in all modes.
4. `for(;;)` remains valid.
5. `for(;;;)` remains invalid.
6. Strict mode can be enabled by parser config and requires semicolons on statement terminators.

## Architecture
### Parser configuration
Add parser configuration carried by `TokenIterator`, for example:

```ts
grammar?: {
  semicolonMode?: "optional-eol" | "required";
}
```

Default mode: `optional-eol`.

Strict mode: `required` (explicit opt-in by caller).

### No lexer changes for this feature
Semicolon behavior is handled in parser only for this iteration.
This keeps changes local and low-risk while preserving future migration path.

### Future compatibility
For future Python-like indentation blocks, move structural handling to lexer-level tokens (`NEWLINE`, `INDENT`, `DEDENT`) and parser consumption of those tokens. Current parser-only semicolon support is intentionally scoped and does not block that path.

## Parsing Flow
Create a shared helper for statement terminators, e.g.:

```ts
consumeStmtTerminator(iterator, { forceRequired?: boolean })
```

Behavior:
1. If current token is `;`, consume it.
2. If required (`forceRequired` or mode `required`) and token is not `;`, throw existing unexpected-token error.
3. In `optional-eol` mode, allow omission only if:
   - next token is `}`; or
   - next token is EOF; or
   - next token line is greater than the previous consumed token line.
4. Otherwise throw existing unexpected-token error.

## Parser touchpoints
Replace direct statement-level `consume(semicolon)` calls with the helper in:
- declaration statements
- print / scan statements
- return statements
- break / continue statements
- assignment/function-call/increment statement variants

Keep direct mandatory `consume(semicolon)` in `forStmt` separator positions.

## Error Handling
- Reuse current `iterator.unexpected_token` error path.
- No new translation keys required.
- Same-line missing semicolon errors remain standard parser failures.
- `for(;;;)` remains invalid through existing grammar expectations (extra `;` where `optAttribute` or `)` is expected).

## Testing Plan
### Optional mode tests
1. Accept newline-terminated statements without semicolon:
   - declaration
   - assignment
   - print
   - return
   - break
   - continue
2. Accept omission before `}` and EOF.
3. Reject same-line consecutive statements without semicolon.
4. Keep `for(;;)` valid.
5. Keep `for(;;;)` invalid.

### Strict mode tests
1. With `semicolonMode: "required"`, statement terminators require semicolon.
2. `for` separator behavior unchanged.

### Test plumbing
Update grammar test helper(s) to accept parser options, so the same compile path can be tested under both semicolon modes.

## Non-goals
- Implementing indentation-based blocks in this change.
- Introducing lexer-level virtual semicolon insertion.
- Changing current i18n error catalog.

## Risks and mitigations
1. Risk: false positives/negatives on EOL detection.
   - Mitigation: use token line metadata and cover newline/same-line scenarios in tests.
2. Risk: accidental relaxation inside `for`.
   - Mitigation: keep `for` semicolon consumption explicit and untouched.
3. Risk: broad API changes.
   - Mitigation: add optional parser config with defaults to preserve existing call sites.
