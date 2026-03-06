# Switch-Case Design (Compiler Grammar)

Date: 2026-03-05
Scope: `packages/compiler/src/grammar` (+ required token/lexer and iterator context support)

## Context
The compiler currently supports `if`, `for`, `while`, `break`, `continue`, declarations, assignments, and function calls. There is no `switch` grammar production or parser implementation yet.

This design adds `switch` with C-style fallthrough, case labels supporting integer-like and string literals, and `switch(<expr>)` where expression can be any valid existing expression.

## Requirements (Validated)
1. Switch semantics are C-style fallthrough.
2. Case labels accept integer-like and string literals.
3. `switch` expression accepts any `<expr>`.
4. Keep compatibility with existing IR model (`IF`, `JUMP`, `LABEL`, comparisons).

## Grammar Changes

Add `switch` to statements:

```ebnf
<stmt> -> ... | <switchStmt> | ...
```

Add switch productions:

```ebnf
<switchStmt> -> 'switch' '(' <expr> ')' '{' <caseList> <defaultOpt> '}'
<caseList> -> <caseClause> <caseList> | &
<caseClause> -> 'case' <caseLiteral> ':' <stmtList>
<caseLiteral> -> 'NUMint' | 'NUMoct' | 'NUMhex' | 'STR'
<defaultOpt> -> 'default' ':' <stmtList> | &
```

Statement-list behavior inside switch sections:
- Parsing for a case/default body stops on next `case`, `default`, or `}`.
- This boundary supports natural fallthrough in emitted code.

## Token/Lexer Changes
1. Add reserved words:
- `switch`
- `case`
- `default`

2. Add symbol:
- `:` (colon)

Because identifiers are mapped through `keywordMap`, adding reserved constants is sufficient for keyword recognition.

## Parser and Control-Flow Design

Recommended strategy: linear dispatch chain with labels.

For `switch (expr) { ... }`:
1. Evaluate `<expr>` exactly once into a temp: `switchValueTemp`.
2. Pre-create labels:
- One label per case
- One default label (if default exists)
- One `switchEnd` label
- Intermediate “next-check” labels for chained checks
3. Emit comparison dispatch chain:
- For each case literal:
  - `cmpTemp = (switchValueTemp == caseLiteral)`
  - `IF cmpTemp -> caseLabel else nextCheckLabel`
- After last case check:
  - `JUMP defaultLabel` if default exists, else `JUMP switchEnd`
4. Emit bodies in source order:
- `LABEL case1`, statements
- `LABEL case2`, statements
- ...
- `LABEL default` (if present), statements
- `LABEL switchEnd`

Why this works:
- Fallthrough is natural: without `break`, execution continues to subsequent labeled block.
- Existing IR operations are reused; no interpreter opcode expansion required.

## Break/Continue Semantics
- `break` inside switch exits to `switchEnd`.
- `continue` remains loop-only.
- If `switch` appears inside a loop, `break` in switch exits switch (not loop), matching C behavior.

Implementation-level context model:
- Extend iterator flow context so `break` resolves to nearest breakable construct (loop or switch).
- Continue target remains nearest loop only.

## Validation Rules
1. `case` literal must be one of: int-like or string literal.
2. Duplicate case literals in the same switch are rejected.
3. `case`/`default` outside switch should raise grammar errors.
4. Keep existing unexpected-token behavior for malformed switch syntax.

## Error Messages (New/Updated)
Add grammar i18n keys for:
- `case_outside_switch`
- `default_outside_switch`
- `duplicate_case_label`
- `invalid_case_literal`
- (optional refinement) `break_outside_breakable` if message text should reflect loop/switch context.

## Testing Plan
Add tests covering:
1. Lexer tokenization for `switch`, `case`, `default`, `:`.
2. Parser/IR: int switch with breaks.
3. Parser/IR: string switch with breaks.
4. Parser/IR: fallthrough without break.
5. Parser/IR: default executed.
6. Parser/IR: no default and no match.
7. Error: duplicate case literal.
8. Error: invalid case literal.
9. Behavior: `break` exits switch.
10. Behavior: `continue` in switch (outside loop) errors.

## Alternatives Considered
1. New `SWITCH` IR opcode:
- Cleaner abstraction but requires larger interpreter changes and higher risk.

2. Desugar to nested `if/else if`:
- Simpler structurally but awkward for faithful fallthrough semantics.

Chosen approach (linear dispatch + labels) gives best fit with current architecture and minimal disruption.

## Out of Scope
- Case expressions (non-literals)
- Pattern/range matching
- Jump-table optimization

## Success Criteria
1. Switch parses and emits executable IR with correct fallthrough.
2. Break behavior in switch is correct and does not regress loop handling.
3. String and integer-like case labels work.
4. Invalid switch constructs fail with clear diagnostics.
