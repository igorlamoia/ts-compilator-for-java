import { useState } from "react";
import { useKeywords, KeywordMapping } from "@/contexts/KeywordContext";

export function KeywordCustomizer({
  isOpen,
  setIsOpen,
}: {
  isOpen: boolean;
  setIsOpen: (value: boolean) => void;
}) {
  const { mappings, updateKeyword, resetKeywords, validateKeyword } =
    useKeywords();
  const [errors, setErrors] = useState<Record<string, string | null>>({});

  const handleChange = (original: string, value: string) => {
    updateKeyword(original, value);
    const error = value ? validateKeyword(original, value) : null;
    setErrors((prev: Record<string, string | null>) => ({
      ...prev,
      [original]: error,
    }));
  };

  const handleReset = () => {
    resetKeywords();
    setErrors({});
  };

  const hasChanges = mappings.some(
    (m: KeywordMapping) => m.original !== m.custom,
  );

  return (
    <>
      {/* Modal overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-[3px]"
          onClick={(e) => {
            if (e.target === e.currentTarget) setIsOpen(false);
          }}
        >
          <div
            className="
              w-full max-w-lg mx-4 rounded-xl shadow-2xl
              dark:bg-slate-900 bg-white
              border dark:border-slate-700 border-gray-200
              max-h-[85vh] flex flex-col
            "
          >
            {/* Header */}
            <div className="flex items-center justify-between p-5 border-b dark:border-slate-700 border-gray-200">
              <div>
                <h2 className="text-lg font-bold dark:text-white text-gray-900">
                  Personalizar Palavras Reservadas
                </h2>
                <p className="text-sm dark:text-gray-400 text-gray-500 mt-1">
                  Substitua as keywords padrão por palavras personalizadas
                </p>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="p-1 rounded-md hover:dark:bg-slate-700 hover:bg-gray-100 transition-colors"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>

            {/* Content */}
            <div className="overflow-y-auto p-5 flex-1">
              {/* Column headers */}
              <div className="flex items-center gap-4 mb-3 px-1">
                <span className="w-28 text-xs font-semibold uppercase tracking-wider dark:text-gray-400 text-gray-500">
                  Original
                </span>
                <span className="text-xs dark:text-gray-500 text-gray-400">
                  →
                </span>
                <span className="flex-1 text-xs font-semibold uppercase tracking-wider dark:text-gray-400 text-gray-500">
                  Personalizada
                </span>
              </div>

              <div className="flex flex-col gap-2">
                {mappings.map((mapping: KeywordMapping) => (
                  <div key={mapping.original} className="flex flex-col">
                    <div className="flex items-center gap-4">
                      {/* Label fixa (keyword original) */}
                      <div
                        className="
                          w-28 px-3 py-2 rounded-md text-sm font-mono font-semibold
                          dark:bg-slate-800 bg-gray-100
                          dark:text-blue-400 text-blue-600
                          select-none shrink-0
                        "
                      >
                        {mapping.original}
                      </div>

                      {/* Seta */}
                      <span className="dark:text-gray-500 text-gray-400 shrink-0">
                        →
                      </span>

                      {/* Input editável */}
                      <input
                        type="text"
                        value={mapping.custom}
                        onChange={(e) =>
                          handleChange(mapping.original, e.target.value)
                        }
                        className={`
                          flex-1 px-3 py-2 rounded-md text-sm font-mono
                          dark:bg-slate-800 bg-gray-50
                          dark:text-gray-200 text-gray-800
                          border transition-colors outline-none
                          focus:ring-2 focus:ring-cyan-500/50
                          ${
                            errors[mapping.original]
                              ? "border-red-500 dark:border-red-500"
                              : mapping.original !== mapping.custom
                                ? "border-cyan-500 dark:border-cyan-500"
                                : "dark:border-slate-600 border-gray-300"
                          }
                        `}
                        placeholder={mapping.original}
                        spellCheck={false}
                      />
                    </div>
                    {/* Mensagem de erro */}
                    {errors[mapping.original] && (
                      <span className="text-xs text-red-500 mt-1 ml-[8.5rem]">
                        {errors[mapping.original]}
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Footer */}
            <div className="flex items-center justify-between p-5 border-t dark:border-slate-700 border-gray-200">
              <button
                onClick={handleReset}
                disabled={!hasChanges}
                className={`
                  px-4 py-2 rounded-md text-sm font-medium transition-colors
                  ${
                    hasChanges
                      ? "dark:text-gray-300 text-gray-600 hover:dark:bg-slate-700 hover:bg-gray-100"
                      : "dark:text-gray-600 text-gray-300 cursor-not-allowed"
                  }
                `}
              >
                Restaurar Padrão
              </button>
              <button
                onClick={() => setIsOpen(false)}
                className="
                  px-6 py-2 rounded-md text-sm font-medium
                  bg-cyan-600 text-white hover:bg-cyan-700
                  transition-colors
                "
              >
                Fechar
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
