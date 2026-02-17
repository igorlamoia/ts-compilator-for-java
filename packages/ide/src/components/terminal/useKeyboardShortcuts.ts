import { useEffect } from "react";

export function useKeyboardShortcuts(
  toggleTerminal: () => void,
  isTerminalOpen: boolean,
) {
  // Atalhos globais (ctrl+', ctrl+j, Escape)
  useEffect(() => {
    const handleGlobalKeyDown = (event: globalThis.KeyboardEvent) => {
      const isToggleShortcut =
        event.ctrlKey && ["Quote", "KeyJ"].includes(event.code);

      if (isToggleShortcut) {
        event.preventDefault();
        event.stopPropagation();
        toggleTerminal();
      } else if (event.key === "Escape" && isTerminalOpen) {
        toggleTerminal();
      }
    };

    document.addEventListener("keydown", handleGlobalKeyDown, {
      capture: true,
    });
    return () =>
      document.removeEventListener("keydown", handleGlobalKeyDown, {
        capture: true,
      });
  }, [toggleTerminal, isTerminalOpen]);
}
