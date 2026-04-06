# Saved Language Identity Design

**Date:** 2026-04-06

## Goal

Expand the keyword customizer identity step so the user can:

- choose a language preset as the starting point
- enter a custom language name
- select a language image from a server-side Pixabay-backed search

The saved result must persist as a named language entry in localStorage using the prefix `keyword-customization-`, and the IDE must expose a dropdown that lets the user switch between the saved languages.

## Context

Today the IDE persists only one active `keyword-customization` object. The identity step is currently a preset picker, and the preview label is derived from `selectedPresetId` instead of user-defined metadata.

The new requirement adds a second persistence layer:

- one active runtime customization for the current IDE behavior
- multiple named saved-language entries for user-created languages

## Goals

- Add `languageName` and selected image metadata to the customizer flow.
- Save each created language under a localStorage key with the `keyword-customization-` prefix.
- Keep an index of saved languages so the IDE can populate a dropdown without scanning arbitrary data structures at runtime.
- Keep `keyword-customization` as the active runtime customization so the existing provider and Monaco integration continue to work.
- Add a server-side image search endpoint that proxies Pixabay and keeps the API key off the client.

## Non-Goals

- Do not support image upload.
- Do not redesign the rest of the keyword customizer steps beyond what is needed to carry language identity through the existing flow.
- Do not change compiler semantics outside of loading a different saved customization.

## Options Considered

### Option 1: Per-language keys only

Store each language directly as `keyword-customization-<slug>` and recover the list by scanning localStorage for the prefix.

Pros:

- minimal write path
- matches the requested key shape directly

Cons:

- weak support for ordering and metadata
- awkward duplicate and rename handling
- dropdown loading depends on scanning storage every time

### Option 2: Registry plus per-language entries

Store each language as `keyword-customization-<slug>`, plus a registry key that lists saved languages, plus a dedicated active-language key.

Pros:

- fits the requested key prefix
- gives a stable source for the IDE dropdown
- supports overwrite, filtering, and future metadata without breaking saved entries
- keeps active-language restoration explicit

Cons:

- more code than a flat per-key-only model

### Option 3: Single collection blob

Store all saved languages inside one large object.

Pros:

- simplest to read and write as one object

Cons:

- conflicts with the requested per-language storage pattern
- makes individual entry recovery and debugging worse

## Chosen Approach

Choose Option 2: registry plus per-language entries.

This provides the cleanest model for the dropdown and active-language restoration while still storing each saved language under the required `keyword-customization-<slug>` key pattern.

## Persistence Model

Three storage layers should exist:

- `keyword-customization`: the active runtime customization consumed by `KeywordProvider`
- `keyword-customization-index`: registry of saved languages for the IDE dropdown
- `keyword-customization-<slug>`: one full saved-language entry per custom language

Recommended saved-language shape:

```ts
type SavedKeywordLanguage = {
  name: string;
  slug: string;
  imageUrl: string;
  imageQuery: string;
  presetId: WizardPresetId;
  customization: StoredKeywordCustomization;
};
```

Recommended registry shape:

```ts
type SavedKeywordLanguageIndexEntry = {
  name: string;
  slug: string;
  imageUrl: string;
};
```

Recommended active key:

- `keyword-customization-active`

The registry exists to drive the dropdown and to avoid repeatedly parsing all prefixed keys as the primary source of truth. The per-language entry remains the canonical full payload for each language.

## Save Semantics

Saving the wizard should:

1. require a non-empty language name
2. derive a normalized slug from the entered name
3. build the saved-language payload with the chosen preset and selected image URL
4. upsert the registry entry for that slug
5. write the full language payload to `keyword-customization-<slug>`
6. write the saved customization to `keyword-customization`
7. write the selected slug to `keyword-customization-active`

Duplicate names should resolve by slug. The approved behavior is overwrite rather than duplicate entry creation.

## Identity Step UX

The identity step should evolve from a preset gallery into a language identity editor with three inputs:

- preset cards to pick the base DNA
- a required language name input
- an image search field and result grid for selecting a remote image

Expected flow:

- selecting a preset still applies the preset customization to the draft
- typing a language name updates preview identity immediately
- searching images calls a server-side API route
- selecting an image stores image metadata in wizard state without uploading files

Image selection is optional. Search failure must not block the user from saving a language without an image.

## Preview And Wizard State

The wizard preview should stop deriving the displayed language label only from preset labels. Instead:

- use the custom language name when present
- fall back to the preset label when the name is empty

The customizer context must carry:

- `languageName`
- `languageSlug` as derived data, not editable state
- `languageImageUrl`
- `languageImageQuery`
- `selectedPresetId`

These values belong to the wizard/session layer, not to `StoredKeywordCustomization`, because they describe saved-language identity rather than compiler configuration.

## Server-Side Image Search

Add a Next.js API route such as:

- `/api/language-images/search?q=<query>`

Responsibilities:

- read the Pixabay API key from the server environment
- validate and normalize the query
- fetch Pixabay on the server
- return only the fields the client needs for selection and preview

Recommended response fields:

- `id`
- `previewURL`
- `webformatURL`
- `tags`
- optional attribution fields if desired

The client should not know the Pixabay key and should not call Pixabay directly.

## IDE Dropdown Integration

The IDE shell should expose a dropdown listing saved languages from `keyword-customization-index`.

Selecting a language should:

- load the saved-language entry by slug
- replace the active runtime customization by writing to `keyword-customization`
- update the active-language key
- refresh `KeywordProvider` state and Monaco highlighting

The selected language image should be shown next to the active language when available.

If no saved languages exist, the IDE should continue using the default customization behavior.

## Error Handling

- If the image-search API fails, show an inline error in the identity step and keep the wizard usable.
- If a saved-language entry is corrupt or missing, exclude it from the dropdown and leave the IDE on a safe fallback.
- If the active-language key points to a missing or invalid entry, fall back to the default customization and repair runtime state by keeping `keyword-customization` valid.
- If saving registry or language entries fails, do not switch the active language selection.

## Testing

- Add unit tests for slug normalization, registry upsert behavior, saved-language loading, and fallback behavior.
- Update identity-step tests to cover the required name input, image-search results, and selection behavior.
- Add context tests for save behavior writing:
  - `keyword-customization-index`
  - `keyword-customization-<slug>`
  - `keyword-customization`
  - `keyword-customization-active`
- Add provider tests for restoring the active saved language into runtime customization.
- Add IDE tests for dropdown population and switching between saved languages.

## Implementation Notes

- Keep backward compatibility with the current single active customization by preserving `keyword-customization`.
- Do not move language identity fields into compiler-facing lexer configuration unless a later requirement explicitly needs them there.
- Prefer a small storage helper module so localStorage and registry logic do not spread through context and UI components.
