const LANGUAGE_CREATOR_RETURN_KEY = "language-creator:return";

export function markLanguageCreatorReturn() {
  if (typeof window === "undefined") return;
  window.sessionStorage.setItem(LANGUAGE_CREATOR_RETURN_KEY, "1");
}

export function consumeLanguageCreatorReturn() {
  if (typeof window === "undefined") return false;

  const shouldReturn =
    window.sessionStorage.getItem(LANGUAGE_CREATOR_RETURN_KEY) === "1";

  if (shouldReturn) {
    window.sessionStorage.removeItem(LANGUAGE_CREATOR_RETURN_KEY);
  }

  return shouldReturn;
}
