import { useEffect, useMemo, useState } from "react";
import { useKeywords } from "@/contexts/keyword/KeywordContext";
import {
  listSavedKeywordLanguages,
  loadActiveSavedKeywordLanguage,
  loadSavedKeywordLanguage,
  setActiveSavedKeywordLanguage,
  type SavedKeywordLanguageIndexEntry,
} from "@/lib/keyword-language-storage";

export function LanguageSelector() {
  const { setCustomization } = useKeywords();
  const [languages, setLanguages] = useState<SavedKeywordLanguageIndexEntry[]>(
    [],
  );
  const [selectedSlug, setSelectedSlug] = useState("");

  useEffect(() => {
    const nextLanguages = listSavedKeywordLanguages();
    setLanguages(nextLanguages);
    setSelectedSlug(loadActiveSavedKeywordLanguage()?.slug ?? "");
  }, []);

  const activeLanguage = useMemo(
    () => languages.find((language) => language.slug === selectedSlug) ?? null,
    [languages, selectedSlug],
  );

  if (!languages.length) {
    return null;
  }

  return (
    <div className="flex items-center gap-2">
      {activeLanguage?.imageUrl ? (
        <img
          src={activeLanguage.imageUrl}
          alt={activeLanguage.name}
          className="h-8 w-8 rounded-lg object-cover"
        />
      ) : null}
      <label className="flex items-center gap-2 text-xs text-muted-foreground">
        <span className="hidden md:inline">Linguagem</span>
        <select
          aria-label="Selecionar linguagem salva"
          value={selectedSlug}
          onChange={(event) => {
            const nextSlug = event.target.value;
            const nextLanguage = loadSavedKeywordLanguage(nextSlug);
            if (!nextLanguage) return;

            setActiveSavedKeywordLanguage(nextSlug);
            setCustomization(nextLanguage.customization);
            setSelectedSlug(nextSlug);
          }}
          className="rounded-lg border border-black/10 bg-white/80 px-2 py-1 text-xs text-foreground outline-none dark:border-white/10 dark:bg-black/20"
        >
          {languages.map((language) => (
            <option key={language.slug} value={language.slug}>
              {language.name}
            </option>
          ))}
        </select>
      </label>
    </div>
  );
}
