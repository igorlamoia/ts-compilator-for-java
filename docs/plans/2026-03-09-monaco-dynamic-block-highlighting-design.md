# Monaco Dynamic Block Highlighting Design

**Goal:** Add dynamic Monaco editor behavior so customizable block delimiters like `inicio`/`fim` insert a multi-line scaffold on typing, while semantic keyword categories such as types, conditionals, and loops receive distinct highlighting even after keyword customization.

**Current Context**

The Monaco language is registered in `packages/ide/src/utils/compiler/editor/editor-language.ts` with a Monarch tokenizer and static language configuration. Keyword customization already exists in `packages/ide/src/contexts/KeywordContext.tsx`, which preserves `original -> custom` mappings and block delimiter settings. `EditorContext.tsx` initializes Monaco, applies the tokenizer, and exposes a `retokenize` helper.

Current limitations:
- All customized keywords are highlighted as the same generic `keyword` token.
- Monaco auto-closing only supports character pairs like `{}` and `""`.
- Word-based block delimiters such as `inicio`/`fim` do not insert scaffolds.

**Approved Approach**

Use Monarch tokenization for semantic highlighting and a Monaco provider layer for block scaffold insertion.

This approach keeps the existing editor architecture and extends it in two focused ways:
- Semantic highlighting is driven by original keyword meaning, not the customized visible text.
- Block scaffolding is handled by Monaco snippet/completion or typed-text logic rather than `autoClosingPairs`, because the desired behavior is a multi-line word-based insertion.

Alternatives considered:
- Completion-only logic for both insertion and coloring was rejected because semantic coloring fits Monarch better.
- A parser-aware decoration layer was rejected because it adds more complexity than this feature needs.

**Architecture**

The feature separates semantic tokenization from block insertion.

Semantic highlighting:
- `editor-language.ts` receives structured keyword groups instead of only a flat keyword list.
- Each custom word is assigned to a semantic category based on its original keyword.
- Initial semantic groups:
  - types: `int`, `float`, `string`, `void`, `variavel`, `funcao`
  - conditionals: `if`, `else`, `switch`, `case`, `default`
  - loops: `for`, `while`
  - flow/control: `break`, `continue`, `return`
  - io: `print`, `scan`
- The Monarch tokenizer emits category-specific token types such as `keyword.type`, `keyword.conditional`, and `keyword.loop`.
- Monaco themes in `EditorContext.tsx` define distinct colors for these token classes.

Block scaffold insertion:
- `EditorContext.tsx` registers a Monaco provider tied to the active block delimiters.
- When the user types a complete opener token such as `inicio`, Monaco inserts:

```txt
inicio
  |
fim
```

- The cursor is placed on the indented middle line.
- The provider is active only when block mode is `delimited` and both delimiters are valid.

**Components And Data Flow**

`KeywordContext.tsx` remains the source of truth for editor customization.

Data flow:
1. The user customizes keywords and/or block delimiters.
2. `KeywordContext.tsx` derives:
   - the flat list of all custom keywords
   - semantic keyword groups derived from original keyword identities
   - the active block opener and closer
3. `EditorContext.tsx` refreshes Monaco integration:
   - updates the Monarch provider with the latest semantic groups
   - disposes and re-registers the block scaffold provider with the latest delimiters
   - retokenizes the current model

Design rules:
- Semantic category follows the original keyword identity even after customization.
- Block scaffold behavior follows the current customized delimiters.
- The editor must not retain stale providers after customization changes.

**Trigger Behavior**

The block scaffold provider should:
- trigger only on a complete opener word boundary
- do nothing in comments or strings
- do nothing when delimiters are empty or invalid
- do nothing when block mode is `indentation`
- insert the matching customized closer, not a hard-coded `fim`

The implementation should prefer a Monaco snippet/completion or equivalent typed-text hook over `autoClosingPairs`, because `autoClosingPairs` is not suited for multi-line word-pair insertion.

**Error Handling**

Failure behavior should be non-destructive:
- Invalid or empty block delimiters disable the provider.
- Indentation mode disables the provider.
- If Monaco cannot confirm a safe insertion context, it should do nothing.
- Reconfiguration must dispose the previous provider before installing a new one.

**Testing**

Unit coverage:
- A customized conditional keyword such as `se` still maps to conditional highlighting.
- A customized loop keyword such as `enquanto` still maps to loop highlighting.
- Type keywords remain distinct from generic keywords.

Editor behavior coverage:
- Typing the configured opener inserts the expected three-line scaffold.
- Changing delimiters updates both trigger and inserted closer.
- Indentation mode disables scaffold insertion.
- Invalid or empty delimiters disable scaffold insertion.
- Comments and strings do not trigger scaffold insertion.

**Out Of Scope**

These items are intentionally excluded from this design:
- Parser-aware semantic decorations
- Auto-indentation beyond the scaffold insertion itself
- Additional language-server style intelligence
- Non-block word-pair auto-closing
