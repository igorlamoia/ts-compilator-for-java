# Keyword Hover Descriptions Design

## Context

The IDE already lets users customize the Java-- language vocabulary through the keyword customizer. Today that customization updates Monaco tokenization, completions, and compiler configuration, but the editor has no language-level documentation hover for customized lexemes.

The goal of this design is to add editable descriptions for every customizable lexeme or token-related item so the Monaco editor can show a structured hover when the user places the mouse over the current lexeme in source code.

## Goals

- Let the user write a description for every customizable language item.
- Show a structured Monaco hover with title, semantic category, and description.
- Keep descriptions attached to the semantic item, not to the current lexeme text.
- Persist descriptions as part of the language configuration, not only as local UI state.
- Support fallback hover content even when the user leaves a description blank.

## Non-Goals

- Creating a separate documentation authoring workflow outside the existing keyword customizer.
- Adding rich formatting, markdown editing, or multi-language descriptions.
- Adding hover support for arbitrary identifiers that are not part of the customizable language surface.

## Approved Product Decisions

- Scope covers all customizable items:
  - keyword mappings such as `print`, `if`, `while`
  - operator word aliases
  - boolean literals
  - statement terminator lexeme
  - block delimiters
- The Monaco hover must be structured:
  - title with the current lexeme
  - semantic category
  - description
- When the user does not provide a description, the system still shows hover content using a generated fallback description.
- Descriptions follow lexeme renames because they are attached to the semantic item.
- Description editing happens inline in the same keyword customizer cards/sections as the lexeme fields.
- Descriptions are part of the persisted language configuration.
- Custom block delimiters also participate in the hover system.

## Recommended Approach

Use a unified semantic documentation model for all customizable language items.

Each item gets a stable semantic identifier, for example:

- `keyword.print`
- `keyword.if`
- `operator.logical_and`
- `boolean.true`
- `terminator.statement`
- `delimiter.open`
- `delimiter.close`

The lexeme remains editable as it is today, but documentation metadata is stored separately and keyed by the semantic identifier. This lets the hover system resolve the current text shown in the editor back to the item that owns the description, even after renames.

## Data Model

Introduce a new configuration block dedicated to language documentation metadata.

Proposed shape:

```ts
type IDELanguageDocumentationEntry = {
  description: string;
};

type IDELanguageDocumentationMap = Record<
  string,
  IDELanguageDocumentationEntry
>;
```

This documentation map becomes part of the customization state and the exported compiler/editor configuration payload. The semantic identifier is the stable key. The current lexeme is still derived from the rest of the customization state:

- `mappings` for keywords
- `operatorWordMap` for operator aliases
- `booleanLiteralMap` for booleans
- `statementTerminatorLexeme` for the custom terminator
- `blockDelimiters` for delimiter-based blocks

This separation keeps lexical behavior and documentation behavior independent while still persisting both in the same config object.

## Semantic Categories

The hover card should expose a category label generated from the semantic item kind. Initial categories:

- `Tipo`
- `Condicional`
- `Laço de repetição`
- `Controle de fluxo`
- `Entrada/Saída`
- `Operador`
- `Literal booleano`
- `Terminador`
- `Delimitador de bloco`

These categories should be computed centrally so completions, hover, and future language metadata features can share the same semantic classification.

## Hover Resolution

The Monaco hover provider should be updated from the same keyword customization flow that already updates tokenization and completions.

Resolution flow:

1. Read the word or token under the cursor.
2. Resolve that lexeme against the active customization:
   - keyword custom value
   - operator alias
   - boolean literal alias
   - statement terminator
   - block delimiter
3. Map the matched lexeme to its semantic identifier.
4. Build hover content:
   - title: current lexeme
   - category: semantic category label
   - description: user-provided description or generated fallback
5. Return no hover if the token is not part of the customizable language surface.

The provider should be disposed and re-registered in the same way the completion provider is already refreshed, preventing duplicate Monaco registrations.

## Fallback Description Rules

Every supported item should have a default description generator keyed by semantic identifier, not by current lexeme text. This keeps the fallback stable across renames.

Examples:

- `keyword.print` -> explains output behavior
- `operator.logical_and` -> explains boolean conjunction
- `delimiter.open` -> explains block opening semantics
- `terminator.statement` -> explains how an instruction ends

If a user description is blank, the hover still appears with:

- the current lexeme as title
- the semantic category
- the generated default description

## Keyword Customizer UX

The existing wizard structure remains intact. No new step is introduced.

Each editable custom language item receives:

- an input for the lexeme or token alias
- a second control for description editing

This should be added inline in the same section where the user already edits the lexeme, preserving the mental link between the renamed token and its explanation.

Expected coverage by step:

- `IOStep`: `print`, `scan`, variable/type keywords
- `StructureStep`: statement terminator and block delimiters
- `RulesStep`: boolean literals and operator word aliases
- `FlowStep`: flow-control keywords
- other existing keyword-editing sections: their respective mappings

The description control can be a compact textarea or a secondary input with enough room for sentence-length content.

## Persistence and Migration

Existing saved configurations must continue to load.

Migration strategy:

- Treat the new documentation block as optional during normalization.
- If the stored config does not contain documentation entries, initialize an empty documentation map.
- Preserve current saved custom lexemes unchanged.
- Generate hover fallback content even for migrated configs with no user-authored descriptions.

This avoids breaking users who already have local customization data in storage.

## Integration Points

Primary code areas expected to participate:

- keyword customization state and normalization
- compiler/editor config payload types
- Monaco language registration/update helpers
- keyword customizer step UIs
- any config utilities that serialize or normalize language settings

The hover feature should be wired through the existing `KeywordContext` so the editor keeps a single source of truth for active language metadata.

## Error Handling

- Empty descriptions are valid and should fall back to generated content.
- Unknown semantic identifiers in stored documentation should be ignored safely.
- Hover registration should degrade gracefully if Monaco hover APIs are unavailable in tests or mocks.
- Delimiter hovers should only resolve when delimiter mode and values make them active in the language.

## Testing Strategy

Coverage should include:

- normalization and migration of configs without documentation metadata
- persistence of user-written descriptions
- semantic binding after lexeme renames
- hover generation for:
  - keywords
  - operators
  - boolean literals
  - statement terminator
  - block delimiters
- fallback behavior when descriptions are blank
- provider lifecycle to avoid duplicate Monaco registrations

## Risks

- If hover resolution is implemented by matching only current text, descriptions can drift or be lost after renames.
- If semantic categories are duplicated across UI and Monaco helpers, labels will diverge over time.
- If inline description controls are added inconsistently across steps, some customizable items may silently miss documentation support.

## Summary

The feature should be built as a semantic documentation layer on top of the existing customization model. Lexemes remain editable, but documentation is keyed by stable semantic identifiers and persisted with the language configuration. Monaco consumes that combined state to show a structured hover for every custom language item, with generated fallback descriptions when the user does not write one.
