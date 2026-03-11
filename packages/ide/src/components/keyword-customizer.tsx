import { FormEvent, useEffect, useMemo, useRef, useState } from "react";
import {
  useKeywords,
  KeywordMapping,
  BlockDelimiters,
} from "@/contexts/KeywordContext";
import type {
  IDEBlockMode,
  IDEOperatorWordMap,
  IDESemicolonMode,
  IDETypingMode,
} from "@/entities/compiler-config";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import { X } from "lucide-react";
import { BorderBeam } from "./ui/border-beam";
import { HeroButton } from "./buttons/hero";
import { DEFAULT_OPERATOR_WORD_MAP } from "@/lib/keyword-map";
import { OPERATOR_WORD_FIELDS } from "@/lib/operator-word-map";

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
  switch: "Seleciona um bloco com base no valor de uma expressão.",
  case: "Define um ramo dentro do switch para um valor específico.",
  default: "Executa quando nenhum case do switch corresponde.",
  variavel: "Declara uma variável no modo não tipado.",
  funcao: "Declara uma função no modo não tipado.",
};

export function KeywordCustomizer() {
  const {
    mappings,
    blockDelimiters,
    operatorWordMap,
    replaceKeywords,
    setOperatorWordMap,
    setBlockDelimiters,
    validateKeyword,
    validateOperatorWordMap,
    validateBlockDelimiters,
    semicolonMode,
    setSemicolonMode,
    blockMode,
    setBlockMode,
    typingMode,
    setTypingMode,
    isOpenKeywordCustomizer: isOpen,
    setIsOpenKeywordCustomizer: setIsOpen,
  } = useKeywords();
  const [draftMappings, setDraftMappings] =
    useState<KeywordMapping[]>(mappings);
  const [draftBlockDelimiters, setDraftBlockDelimiters] =
    useState<BlockDelimiters>(blockDelimiters);
  const [draftOperatorWordMap, setDraftOperatorWordMap] =
    useState<IDEOperatorWordMap>(operatorWordMap);
  const [draftSemicolonMode, setDraftSemicolonMode] =
    useState<IDESemicolonMode>(semicolonMode);
  const [draftBlockMode, setDraftBlockMode] = useState<IDEBlockMode>(blockMode);
  const [draftTypingMode, setDraftTypingMode] = useState<IDETypingMode>(typingMode);
  const [currentStep, setCurrentStep] = useState(0);
  const [currentError, setCurrentError] = useState<string | null>(null);
  const [delimiterError, setDelimiterError] = useState<string | null>(null);
  const [operatorError, setOperatorError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    if (isOpen) {
      setDraftMappings(mappings);
      setDraftBlockDelimiters(blockDelimiters);
      setDraftOperatorWordMap(operatorWordMap);
      setDraftSemicolonMode(semicolonMode);
      setDraftBlockMode(blockMode);
      setDraftTypingMode(typingMode);
      setCurrentStep(0);
      setCurrentError(null);
      setDelimiterError(null);
      setOperatorError(null);
    }
  }, [
    isOpen,
    mappings,
    blockDelimiters,
    operatorWordMap,
    semicolonMode,
    blockMode,
    typingMode,
  ]);

  useEffect(() => {
    if (isOpen) {
      inputRef.current?.focus();
      inputRef.current?.select();
    }
  }, [isOpen, currentStep]);

  useEffect(() => {
    if (draftBlockMode === "indentation") {
      setDelimiterError(null);
      return;
    }
    setDelimiterError(validateBlockDelimiters(draftBlockDelimiters));
  }, [draftBlockMode, draftBlockDelimiters, validateBlockDelimiters]);

  useEffect(() => {
    setOperatorError(
      validateOperatorWordMap(
        draftOperatorWordMap,
        draftMappings,
        getOperatorValidationDelimiters(),
      ),
    );
  }, [
    draftOperatorWordMap,
    draftMappings,
    draftBlockDelimiters,
    draftBlockMode,
    validateOperatorWordMap,
  ]);

  const hasChanges = useMemo(
    () =>
      draftMappings.some((m: KeywordMapping) => m.original !== m.custom) ||
      OPERATOR_WORD_FIELDS.some(
        ({ key }) => draftOperatorWordMap[key] !== operatorWordMap[key],
      ) ||
      draftBlockDelimiters.open !== blockDelimiters.open ||
      draftBlockDelimiters.close !== blockDelimiters.close ||
      draftSemicolonMode !== semicolonMode ||
      draftBlockMode !== blockMode ||
      draftTypingMode !== typingMode,
    [
      draftMappings,
      draftOperatorWordMap,
      operatorWordMap,
      draftBlockDelimiters,
      blockDelimiters,
      draftSemicolonMode,
      semicolonMode,
      draftBlockMode,
      blockMode,
      draftTypingMode,
      typingMode,
    ],
  );

  const currentMapping = draftMappings[currentStep];

  const validateDraftKeyword = (
    original: string,
    custom: string,
    mappingsToValidate: KeywordMapping[] = draftMappings,
  ) => {
    return validateKeyword(original, custom, mappingsToValidate);
  };

  const getOperatorValidationDelimiters = (): BlockDelimiters =>
    draftBlockMode === "delimited"
      ? draftBlockDelimiters
      : { open: "", close: "" };

  const handleChange = (value: string) => {
    if (!currentMapping) return;
    const nextMappings = draftMappings.map((mapping, index) =>
      index === currentStep ? { ...mapping, custom: value } : mapping,
    );
    setDraftMappings(nextMappings);
    setCurrentError(
      validateDraftKeyword(currentMapping.original, value, nextMappings),
    );
  };

  const handleResetDraft = () => {
    const resetMappings = draftMappings.map((mapping) => ({
      ...mapping,
      custom: mapping.original,
    }));
    const resetBlockDelimiters = { open: "", close: "" };
    const resetSemicolonMode: IDESemicolonMode = "optional-eol";
    const resetBlockMode: IDEBlockMode = "delimited";
    const resetTypingMode: IDETypingMode = "typed";
    setDraftMappings(resetMappings);
    setDraftBlockDelimiters(resetBlockDelimiters);
    setDraftOperatorWordMap({ ...DEFAULT_OPERATOR_WORD_MAP });
    setDraftSemicolonMode(resetSemicolonMode);
    setDraftBlockMode(resetBlockMode);
    setDraftTypingMode(resetTypingMode);
    replaceKeywords(resetMappings);
    setOperatorWordMap({ ...DEFAULT_OPERATOR_WORD_MAP });
    setBlockDelimiters(resetBlockDelimiters);
    setSemicolonMode(resetSemicolonMode);
    setBlockMode(resetBlockMode);
    setTypingMode(resetTypingMode);
    setCurrentError(null);
    setDelimiterError(null);
    setOperatorError(null);
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
    if (draftBlockMode === "delimited") {
      const blockError = validateBlockDelimiters(draftBlockDelimiters);
      if (blockError) {
        setDelimiterError(blockError);
        return;
      }
    } else {
      setDelimiterError(null);
    }
    const nextOperatorError = validateOperatorWordMap(
      draftOperatorWordMap,
      draftMappings,
      getOperatorValidationDelimiters(),
    );
    if (nextOperatorError) {
      setOperatorError(nextOperatorError);
      return;
    }
    replaceKeywords(draftMappings);
    setOperatorWordMap(draftOperatorWordMap);
    setSemicolonMode(draftSemicolonMode);
    setBlockMode(draftBlockMode);
    setTypingMode(draftTypingMode);
    setBlockDelimiters({
      open: draftBlockDelimiters.open.trim(),
      close: draftBlockDelimiters.close.trim(),
    });
    setCurrentError(null);
    setDelimiterError(null);
    setOperatorError(null);
    setIsOpen(false);
  };

  const handleDelimiterChange = (
    field: keyof BlockDelimiters,
    value: string,
  ) => {
    const next = {
      ...draftBlockDelimiters,
      [field]: value,
    };
    setDraftBlockDelimiters(next);
    if (draftBlockMode === "delimited") {
      setDelimiterError(validateBlockDelimiters(next));
      return;
    }
    setDelimiterError(null);
  };

  const handleSubmitCurrentStep = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (currentStep < draftMappings.length - 1) {
      goToNext();
      return;
    }
    handleSave();
  };

  const handleOperatorAliasChange = (
    field: keyof IDEOperatorWordMap,
    value: string,
  ) => {
    const next = {
      ...draftOperatorWordMap,
      [field]: value,
    };
    setDraftOperatorWordMap(next);
    setOperatorError(
      validateOperatorWordMap(
        next,
        draftMappings,
        getOperatorValidationDelimiters(),
      ),
    );
  };

  if (!currentMapping) return null;

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="mx-4 overflow-hidden">
        <form
          onSubmit={handleSubmitCurrentStep}
          role="dialog"
          aria-modal="true"
          aria-labelledby="keyword-customizer-title"
          aria-describedby="keyword-customizer-description"
          className="flex h-full min-h-0 flex-col"
        >
          <DialogHeader>
            <div>
              <DialogTitle id="keyword-customizer-title">
                Personalização Interativa de Comandos
              </DialogTitle>
              <DialogDescription id="keyword-customizer-description">
                Responda uma pergunta por vez e salve no final
              </DialogDescription>
            </div>
            <DialogClose
              type="button"
              aria-label="Fechar personalizador de keywords"
              className="p-1 rounded-md hover:dark:bg-slate-700 hover:bg-gray-100 transition-colors cursor-pointer"
            >
              <X />
            </DialogClose>
          </DialogHeader>

          <div className="min-h-0 flex-1 overflow-y-auto p-5">
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
                        hover:dark:bg-slate-700 hover:bg-gray-100 cursor-pointer
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
                    <span className="text-cyan-600 dark:text-(--color-primary) font-semibold">
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
                {Math.round(((currentStep + 1) / draftMappings.length) * 100)}%
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
                <span className="font-mono font-bold text-cyan-600 dark:text-(--color-primary)">
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

            <div className="mt-8 flex flex-col gap-3">
              <p className="text-xs uppercase tracking-wider font-semibold dark:text-gray-400 text-gray-500">
                Modo de Ponto e Vírgula
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setDraftSemicolonMode("optional-eol")}
                  className={`px-3 py-2 text-sm rounded-md border text-left ${
                    draftSemicolonMode === "optional-eol"
                      ? "border-cyan-500 dark:border-cyan-500 dark:bg-slate-800 bg-cyan-50"
                      : "dark:border-slate-600 border-gray-300"
                  }`}
                >
                  Opcional no fim da linha
                </button>
                <button
                  type="button"
                  onClick={() => setDraftSemicolonMode("required")}
                  className={`px-3 py-2 text-sm rounded-md border text-left ${
                    draftSemicolonMode === "required"
                      ? "border-cyan-500 dark:border-cyan-500 dark:bg-slate-800 bg-cyan-50"
                      : "dark:border-slate-600 border-gray-300"
                  }`}
                >
                  Obrigatório
                </button>
              </div>
            </div>

            <div className="mt-6 flex flex-col gap-3">
              <p className="text-xs uppercase tracking-wider font-semibold dark:text-gray-400 text-gray-500">
                Modo de Bloco
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setDraftBlockMode("delimited")}
                  className={`px-3 py-2 text-sm rounded-md border text-left ${
                    draftBlockMode === "delimited"
                      ? "border-cyan-500 dark:border-cyan-500 dark:bg-slate-800 bg-cyan-50"
                      : "dark:border-slate-600 border-gray-300"
                  }`}
                >
                  Delimitadores de bloco
                </button>
                <button
                  type="button"
                  onClick={() => setDraftBlockMode("indentation")}
                  className={`px-3 py-2 text-sm rounded-md border text-left ${
                    draftBlockMode === "indentation"
                      ? "border-cyan-500 dark:border-cyan-500 dark:bg-slate-800 bg-cyan-50"
                      : "dark:border-slate-600 border-gray-300"
                  }`}
                >
                  Indentação
                </button>
              </div>
            </div>

            <div className="mt-6 flex flex-col gap-3">
              <p className="text-xs uppercase tracking-wider font-semibold dark:text-gray-400 text-gray-500">
                Modo de Tipagem
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setDraftTypingMode("typed")}
                  className={`px-3 py-2 text-sm rounded-md border text-left ${
                    draftTypingMode === "typed"
                      ? "border-cyan-500 dark:border-cyan-500 dark:bg-slate-800 bg-cyan-50"
                      : "dark:border-slate-600 border-gray-300"
                  }`}
                >
                  Tipado
                </button>
                <button
                  type="button"
                  onClick={() => setDraftTypingMode("untyped")}
                  className={`px-3 py-2 text-sm rounded-md border text-left ${
                    draftTypingMode === "untyped"
                      ? "border-cyan-500 dark:border-cyan-500 dark:bg-slate-800 bg-cyan-50"
                      : "dark:border-slate-600 border-gray-300"
                  }`}
                >
                  Não tipado
                </button>
              </div>
            </div>

            <div className="mt-6 flex flex-col gap-3">
              <p className="text-xs uppercase tracking-wider font-semibold dark:text-gray-400 text-gray-500">
                Alias de Operadores
              </p>
              <p className="text-sm dark:text-gray-400 text-gray-500">
                Configure palavras para os operadores lógicos e relacionais sem
                perder o suporte aos símbolos originais.
              </p>

              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                {OPERATOR_WORD_FIELDS.map((field) => (
                  <label
                    key={field.key}
                    className="flex flex-col gap-2 rounded-md border border-gray-300 bg-gray-50 p-3 text-sm dark:border-slate-600 dark:bg-slate-800"
                  >
                    <span className="flex items-center justify-between gap-3">
                      <span className="dark:text-gray-200 text-gray-800">
                        {field.label}
                      </span>
                      <span className="font-mono text-cyan-600 dark:text-(--color-primary)">
                        {field.symbol}
                      </span>
                    </span>
                    <input
                      type="text"
                      value={draftOperatorWordMap[field.key] ?? ""}
                      onChange={(e) =>
                        handleOperatorAliasChange(field.key, e.target.value)
                      }
                      placeholder={DEFAULT_OPERATOR_WORD_MAP[field.key]}
                      spellCheck={false}
                      className={`
                        w-full rounded-md border px-3 py-2 font-mono text-sm outline-none transition-colors
                        dark:bg-slate-900 dark:text-gray-200 bg-white text-gray-800
                        focus:ring-2 focus:ring-cyan-500/50
                        ${operatorError ? "border-red-500 dark:border-red-500" : "dark:border-slate-600 border-gray-300"}
                      `}
                    />
                  </label>
                ))}
              </div>

              {operatorError && (
                <span className="text-xs text-red-500">{operatorError}</span>
              )}
            </div>

            <div className="mt-6 flex flex-col gap-3">
              <p className="text-xs uppercase tracking-wider font-semibold dark:text-gray-400 text-gray-500">
                Delimitadores de Bloco (Opcional)
              </p>
              <p className="text-sm dark:text-gray-400 text-gray-500">
                Configure palavras para abrir/fechar blocos no lugar de {"{"} e
                {"}"} (ex.: <code>begin</code> e <code>end</code>).
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <input
                  type="text"
                  value={draftBlockDelimiters.open}
                  onChange={(e) => handleDelimiterChange("open", e.target.value)}
                  disabled={draftBlockMode === "indentation"}
                  placeholder="Abertura (ex.: begin)"
                  spellCheck={false}
                  className={`
                    w-full px-3 py-2 rounded-md text-sm font-mono
                    dark:bg-slate-800 bg-gray-50
                    dark:text-gray-200 text-gray-800
                    border transition-colors outline-none
                    focus:ring-2 focus:ring-cyan-500/50
                    disabled:opacity-50 disabled:cursor-not-allowed
                    ${delimiterError ? "border-red-500 dark:border-red-500" : "dark:border-slate-600 border-gray-300"}
                  `}
                />
                <input
                  type="text"
                  value={draftBlockDelimiters.close}
                  onChange={(e) =>
                    handleDelimiterChange("close", e.target.value)
                  }
                  disabled={draftBlockMode === "indentation"}
                  placeholder="Fechamento (ex.: end)"
                  spellCheck={false}
                  className={`
                    w-full px-3 py-2 rounded-md text-sm font-mono
                    dark:bg-slate-800 bg-gray-50
                    dark:text-gray-200 text-gray-800
                    border transition-colors outline-none
                    focus:ring-2 focus:ring-cyan-500/50
                    disabled:opacity-50 disabled:cursor-not-allowed
                    ${delimiterError ? "border-red-500 dark:border-red-500" : "dark:border-slate-600 border-gray-300"}
                  `}
                />
              </div>

              {draftBlockMode === "delimited" && delimiterError && (
                <span className="text-xs text-red-500">{delimiterError}</span>
              )}
            </div>
          </div>

          <DialogFooter>
            <HeroButton
              onClick={handleResetDraft}
              type="button"
              variant="outline"
              disabled={!hasChanges}
            >
              Restaurar Padrão
            </HeroButton>

            <div className="flex items-center gap-2">
              <HeroButton
                variant="ghost"
                onClick={goToPrevious}
                type="button"
                disabled={currentStep === 0}
              >
                Anterior
              </HeroButton>

              {currentStep < draftMappings.length - 1 ? (
                <HeroButton type="submit" variant="ghost">
                  Próxima
                </HeroButton>
              ) : (
                <HeroButton type="submit" className="">
                  Salvar e Aplicar
                </HeroButton>
              )}
            </div>
          </DialogFooter>
        </form>
        <BorderBeam
          colorFrom="#0dccf2"
          colorTo="#34d399"
          duration={8}
          size={80}
        />
      </DialogContent>
    </Dialog>
  );
}
