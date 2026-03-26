# Strict Indentation Design

## Context

The project already supports an indentation-based block mode in the compiler. In that mode, the lexer measures leading whitespace, emits `NEWLINE`, `INDENT`, and `DEDENT` tokens, and the parser consumes those structural tokens to parse blocks.

Today, indentation is numeric but permissive:

- the lexer accepts any deeper indentation level as long as it is greater than the current block depth
- sibling lines are not constrained by a single inferred indentation unit
- nested blocks can effectively jump multiple logical levels at once

The requested change is to make indentation exact in the Python sense:

- within a block, sibling lines must use the exact same indentation depth
- nested blocks must be indented exactly one level deeper than their parent block
- the indentation unit should be inferred from the first valid block indentation in the file and then enforced for the rest of the file

## Goals

- Enforce exact block indentation in indentation mode.
- Infer the indentation unit from the first valid block increase.
- Require every later nested block to increase by exactly one inferred unit.
- Keep sibling statements within a block aligned to the exact same depth.
- Preserve the current parser architecture where the lexer owns indentation structure and the parser consumes `INDENT` and `DEDENT`.

## Non-Goals

- Do not redesign the parser to understand indentation widths directly.
- Do not introduce user-configurable indentation width in this change.
- Do not change delimited block mode behavior.
- Do not add IDE-only enforcement as the primary correctness mechanism.

## Options Considered

### Option 1: Strict lexer inference

Keep indentation policy entirely in the lexer. Infer an `indentUnit` from the first valid indentation increase, then enforce exact one-level nesting and exact sibling alignment for the rest of the file.

Pros:

- Best fit with the current architecture.
- Smallest implementation footprint.
- Keeps diagnostics close to the source of the error.
- Leaves parser behavior largely unchanged.

Cons:

- The inferred unit is implicit rather than explicitly configurable.

### Option 2: Lexer inference with explicit policy config

Add a formal indentation policy object to lexer configuration while still enforcing the rule in the lexer.

Pros:

- More extensible if the project later wants configurable indentation policies.
- Makes the rule explicit in config payloads.

Cons:

- Larger API and IDE surface area than required for the requested behavior.
- Extra plumbing for a rule that can already be expressed internally.

### Option 3: Hybrid lexer and parser validation

Keep lexer depth handling loose and add parser validation for exact block indentation semantics.

Pros:

- Could centralize some semantic checks nearer to block parsing.

Cons:

- Poor fit for the existing design.
- Splits one concern across two layers.
- Harder to maintain and reason about than lexer-only enforcement.

## Chosen Approach

Choose Option 1: strict lexer inference.

This matches the current architecture cleanly:

- the lexer already owns indentation measurement and emits structural block tokens
- the parser already consumes those tokens without caring how the indentation width was derived

That means the requested behavior can be delivered by tightening lexer policy without redesigning grammar production code.

## Architecture

### Lexer

The strict indentation rule belongs in [`packages/compiler/src/lexer/index.ts`](../../packages/compiler/src/lexer/index.ts).

Recommended model:

- keep `indentStack` as the stack of active indentation depths
- add an internal `indentUnit: number | null`
- keep the current whitespace scanning logic in `readIndentDepth()`
- keep mixed tabs/spaces invalid as it is today

Behavior on each structural newline in indentation mode:

- if the next non-whitespace line is blank or comment-only, ignore it structurally
- if `depth === currentDepth`, treat the line as a sibling statement in the same block
- if `depth > currentDepth`, only allow a single logical level increase
- on the first valid increase, set `indentUnit = depth - currentDepth`
- on every later increase, require `depth - currentDepth === indentUnit`
- if `depth < currentDepth`, emit `DEDENT` tokens until the target depth is reached and reject any target depth that is not an existing stack level

This gives the required Python-like behavior:

- siblings inside a block align to one exact depth
- nested blocks go exactly one level deeper than the parent
- dedent returns only to valid ancestor levels

### Parser

The parser should remain structurally unchanged:

- [`packages/compiler/src/grammar/syntax/blockStmt.ts`](../../packages/compiler/src/grammar/syntax/blockStmt.ts)
- [`packages/compiler/src/grammar/syntax/listStmt.ts`](../../packages/compiler/src/grammar/syntax/listStmt.ts)
- [`packages/compiler/src/grammar/syntax/stmt.ts`](../../packages/compiler/src/grammar/syntax/stmt.ts)

These files already operate on `INDENT` and `DEDENT` tokens and do not need to know the indentation width. The parser should continue treating indentation as a lexical structure concern.

### IDE

No IDE redesign is required for correctness.

The existing compiler payload flow already forwards `indentationBlock`, so the strict rule can be enforced entirely by the backend/compiler path first. IDE-side hints or validation can be added later if desired, but they are not required for the requested behavior.

## Error Handling

Errors should remain lexer errors.

The existing lexer already reports invalid structural indentation cases such as mixed tabs and spaces, unexpected indentation, and invalid dedent. The new rule should extend that same error path.

Required validation points:

- when entering the first nested block, record the inferred indentation unit
- when entering any later nested block, reject if the depth increase differs from the inferred unit
- when a line dedents, reject if the target depth is not one of the previously opened block depths
- when indentation increases without the previous significant token being `:`, keep rejecting it as unexpected indentation

This keeps diagnostics early and precise, which is preferable to detecting indentation shape later in parsing.

## Testing Strategy

Primary coverage should be in lexer tests.

Add success cases for:

- first valid nested block infers the indentation unit
- sibling lines inside one block keep the exact same depth
- nested blocks increase by exactly one inferred unit
- dedent back to a valid ancestor depth succeeds

Add failure cases for:

- a nested block that jumps multiple logical levels at once
- sibling lines inside the same block using different depths
- a later nested block using a different indentation unit than the inferred first unit
- dedent to a depth that was never opened

Parser coverage should stay light and confirm that valid strict-indentation token streams continue to parse successfully.

## Risks

- Existing indentation-mode code that relied on arbitrary depth jumps will start failing.
- Error messages may need refinement if they are too generic for the new exact-indent failures.
- The inferred indentation unit must be stable across the file or diagnostics will become confusing.

## Success Criteria

- Indentation mode enforces exact sibling alignment within each block.
- The first valid block indentation defines the file-wide indentation unit.
- Every later nested block must be exactly one inferred unit deeper than its parent.
- Dedent is only valid to previously opened block depths.
- Delimited block mode remains unchanged.
