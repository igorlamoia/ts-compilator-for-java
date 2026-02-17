import React, { useEffect } from "react";

export function useKeyboardShortcuts(
  toggleTerminal: () => void,
  isTerminalOpen: boolean,
  setIsExplorerOpen?: React.Dispatch<React.SetStateAction<boolean>>,
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

      // Atalho para abrir/fechar o explorer (ctrl+e)
      if (
        (event.ctrlKey && event.code === "KeyE") ||
        (event.ctrlKey && event.code === "KeyB")
      ) {
        event.preventDefault();
        event.stopPropagation();
        if (setIsExplorerOpen) {
          setIsExplorerOpen((prev) => !prev);
        }
      }
    };

    document.addEventListener("keydown", handleGlobalKeyDown, {
      capture: true,
    });
    return () =>
      document.removeEventListener("keydown", handleGlobalKeyDown, {
        capture: true,
      });
  }, [toggleTerminal, isTerminalOpen, setIsExplorerOpen]);
}
