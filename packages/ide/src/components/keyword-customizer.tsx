import { FormEvent, useEffect, useMemo, useRef, useState } from "react";
import { useKeywords, KeywordMapping } from "@/contexts/KeywordContext";

export function KeywordCustomizer({
  isOpen,
  setIsOpen,
}: {
  isOpen: boolean;
  setIsOpen: (value: boolean) => void;
}) {
  const { mappings, replaceKeywords } = useKeywords();
  const [draftMappings, setDraftMappings] =
    useState<KeywordMapping[]>(mappings);
  const [currentStep, setCurrentStep] = useState(0);
  const [currentError, setCurrentError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);

  const KEYWORD_EXPLANATIONS: Record<string, string> = {
    int: "Tipo numérico para números inteiros.",
    float: "Tipo numérico para números com casas decimais.",
    string: "Tipo de texto.",
    void: "Usado quando uma função não retorna valor.",
    for: "Laço de repetição com início, condição e incremento.",
    while: "Laço que repete enquanto a condição for verdadeira.",
    break: "Interrompe imediatamente um laço.",
    continue: "Pula para a próxima iteração do laço.",
    if: "Executa um bloco quando a condição é verdadeira.",
    else: "Executa o bloco alternativo do if.",
    return: "Retorna um valor e encerra a função.",
    print: "Comando para saída de dados na tela.",
    scan: "Comando para leitura de dados de entrada.",
  };

  useEffect(() => {
    if (isOpen) {
      setDraftMappings(mappings);
      setCurrentStep(0);
      setCurrentError(null);
    }
  }, [isOpen, mappings]);

  useEffect(() => {
    if (isOpen) {
      inputRef.current?.focus();
      inputRef.current?.select();
    }
  }, [isOpen, currentStep]);

  const hasChanges = useMemo(
    () => draftMappings.some((m: KeywordMapping) => m.original !== m.custom),
    [draftMappings],
  );

  const currentMapping = draftMappings[currentStep];

  const validateDraftKeyword = (original: string, custom: string) => {
    if (!custom.trim()) return "A palavra não pode ser vazia.";
    if (!/^[a-zA-Z]+$/.test(custom)) {
      return "Use apenas letras (sem números, espaços ou símbolos).";
    }
    const conflict = draftMappings.find(
      (m: KeywordMapping) => m.original !== original && m.custom === custom,
    );
    if (conflict) {
      return `"${custom}" já está sendo usada para "${conflict.original}".`;
    }
    return null;
  };

  const handleChange = (value: string) => {
    if (!currentMapping) return;
    setDraftMappings((prev) =>
      prev.map((mapping, index) =>
        index === currentStep ? { ...mapping, custom: value } : mapping,
      ),
    );
    setCurrentError(validateDraftKeyword(currentMapping.original, value));
  };

  const handleResetDraft = () => {
    const resetMappings = draftMappings.map((mapping) => ({
      ...mapping,
      custom: mapping.original,
    }));
    setDraftMappings(resetMappings);
    replaceKeywords(resetMappings);
    setCurrentError(null);
  };

  const goToPrevious = () => {
    setCurrentError(null);
    setCurrentStep((prev) => Math.max(0, prev - 1));
  };

  const goToNext = () => {
    if (!currentMapping) return;
    const error = validateDraftKeyword(
      currentMapping.original,
      currentMapping.custom,
    );
    if (error) {
      setCurrentError(error);
      return;
    }
    setCurrentError(null);
    setCurrentStep((prev) => Math.min(draftMappings.length - 1, prev + 1));
  };

  const handleSave = () => {
    for (let index = 0; index < draftMappings.length; index++) {
      const mapping = draftMappings[index];
      const error = validateDraftKeyword(mapping.original, mapping.custom);
      if (error) {
        setCurrentStep(index);
        setCurrentError(error);
        return;
      }
    }
    replaceKeywords(draftMappings);
    setCurrentError(null);
    setIsOpen(false);
  };

  const handleSubmitCurrentStep = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (currentStep < draftMappings.length - 1) {
      goToNext();
      return;
    }
    handleSave();
  };

  if (!currentMapping) return null;

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
          <form
            className="
              w-full max-w-lg mx-4 rounded-xl shadow-2xl
              dark:bg-slate-900 bg-white
              border dark:border-slate-700 border-gray-200
              max-h-[85vh] flex flex-col
            "
            onSubmit={handleSubmitCurrentStep}
            role="dialog"
            aria-modal="true"
            aria-labelledby="keyword-customizer-title"
            aria-describedby="keyword-customizer-description"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-5 border-b dark:border-slate-700 border-gray-200">
              <div>
                <h2
                  id="keyword-customizer-title"
                  className="text-lg font-bold dark:text-white text-gray-900"
                >
                  Personalização Interativa de Comandos
                </h2>
                <p
                  id="keyword-customizer-description"
                  className="text-sm dark:text-gray-400 text-gray-500 mt-1"
                >
                  Responda uma pergunta por vez e salve no final
                </p>
              </div>
              <button
                type="button"
                aria-label="Fechar personalizador de keywords"
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
              <div className="mb-6">
                <p className="text-xs uppercase tracking-wider font-semibold dark:text-gray-400 text-gray-500 mb-2">
                  Comandos Atuais
                </p>
                <div className="flex flex-wrap gap-2">
                  {draftMappings.map((mapping, index) => (
                    <button
                      key={`current-${mapping.original}`}
                      type="button"
                      onClick={() => {
                        setCurrentStep(index);
                        setCurrentError(null);
                      }}
                      aria-label={`Ir para a configuração do comando ${mapping.original}`}
                      className={`
                        px-2.5 py-1 rounded-md text-xs font-mono border
                        transition-colors
                        hover:dark:bg-slate-700 hover:bg-gray-100
                        focus:outline-none focus:ring-2 focus:ring-cyan-500/50
                        ${
                          index === currentStep
                            ? "border-cyan-500 dark:border-cyan-500 dark:bg-slate-700 bg-cyan-100"
                            : mapping.custom !== mapping.original
                              ? "border-cyan-500 dark:border-cyan-500 dark:bg-slate-800 bg-cyan-50"
                              : "dark:border-slate-600 border-gray-300 dark:bg-slate-800 bg-gray-50"
                        }
                      `}
                    >
                      <span className="dark:text-gray-300 text-gray-700">
                        {mapping.original}
                      </span>
                      <span className="dark:text-gray-500 text-gray-400 mx-1">
                        →
                      </span>
                      <span className="text-cyan-600 dark:text-cyan-400 font-semibold">
                        {mapping.custom}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex items-center justify-between mb-4">
                <span className="text-xs uppercase tracking-wider font-semibold dark:text-gray-400 text-gray-500">
                  Pergunta {currentStep + 1} de {draftMappings.length}
                </span>
                <span className="text-xs dark:text-gray-500 text-gray-400">
                  {Math.round(((currentStep + 1) / draftMappings.length) * 100)}
                  %
                </span>
              </div>

              <div className="w-full rounded-md h-2 dark:bg-slate-800 bg-gray-100 mb-6 overflow-hidden">
                <div
                  className="h-2 bg-cyan-600 transition-all"
                  style={{
                    width: `${((currentStep + 1) / draftMappings.length) * 100}%`,
                  }}
                />
              </div>

              <div className="flex flex-col gap-3">
                <label
                  htmlFor="keyword-custom-input"
                  className="dark:text-gray-200 text-gray-800 text-base"
                >
                  Como você quer escrever o comando{" "}
                  <span className="font-mono font-bold text-cyan-600 dark:text-cyan-400">
                    {currentMapping.original}
                  </span>
                  ?
                </label>
                <p
                  id="keyword-explanation"
                  className="text-sm dark:text-gray-400 text-gray-500"
                >
                  {KEYWORD_EXPLANATIONS[currentMapping.original]}
                </p>
                <p
                  id="keyword-enter-hint"
                  className="text-xs dark:text-gray-500 text-gray-400"
                >
                  Pressione Enter para avançar.
                </p>

                <input
                  id="keyword-custom-input"
                  ref={inputRef}
                  type="text"
                  value={currentMapping.custom}
                  onChange={(e) => handleChange(e.target.value)}
                  aria-invalid={Boolean(currentError)}
                  aria-describedby={
                    currentError
                      ? "keyword-explanation keyword-enter-hint keyword-error"
                      : "keyword-explanation keyword-enter-hint"
                  }
                  className={`
                    w-full px-3 py-2 rounded-md text-sm font-mono
                    dark:bg-slate-800 bg-gray-50
                    dark:text-gray-200 text-gray-800
                    border transition-colors outline-none
                    focus:ring-2 focus:ring-cyan-500/50
                    ${
                      currentError
                        ? "border-red-500 dark:border-red-500"
                        : currentMapping.original !== currentMapping.custom
                          ? "border-cyan-500 dark:border-cyan-500"
                          : "dark:border-slate-600 border-gray-300"
                    }
                  `}
                  placeholder={currentMapping.original}
                  spellCheck={false}
                />

                {currentError && (
                  <span id="keyword-error" className="text-xs text-red-500">
                    {currentError}
                  </span>
                )}
              </div>
            </div>

            {/* Footer */}
            <div className="flex items-center justify-between p-5 border-t dark:border-slate-700 border-gray-200">
              <button
                onClick={handleResetDraft}
                type="button"
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

              <div className="flex items-center gap-2">
                <button
                  onClick={goToPrevious}
                  type="button"
                  disabled={currentStep === 0}
                  className={`
                    px-4 py-2 rounded-md text-sm font-medium transition-colors
                    ${
                      currentStep === 0
                        ? "dark:text-gray-600 text-gray-300 cursor-not-allowed"
                        : "dark:text-gray-300 text-gray-600 hover:dark:bg-slate-700 hover:bg-gray-100"
                    }
                  `}
                >
                  Anterior
                </button>

                {currentStep < draftMappings.length - 1 ? (
                  <button
                    type="submit"
                    className="
                      px-6 py-2 rounded-md text-sm font-medium
                      bg-cyan-600 text-white hover:bg-cyan-700
                      transition-colors
                    "
                  >
                    Próxima
                  </button>
                ) : (
                  <button
                    type="submit"
                    className="
                      px-6 py-2 rounded-md text-sm font-medium
                      bg-emerald-600 text-white hover:bg-emerald-700
                      transition-colors
                    "
                  >
                    Salvar e Aplicar
                  </button>
                )}
              </div>
            </div>
          </form>
        </div>
      )}
    </>
  );
}
