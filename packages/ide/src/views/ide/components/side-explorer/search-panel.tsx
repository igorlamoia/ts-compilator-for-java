import {
  ChevronRight,
  Replace,
  CaseSensitive,
  Regex,
  WholeWord,
  ReplaceAll,
} from "lucide-react";
import { PerfectScrollbar } from "@/components/ui/perfect-scrollbar";
import {
  InputWithActions,
  InputActionButton,
} from "@/components/ui/input-with-actions";
import IconButton from "@/components/buttons/icon-button";
import { useSearch, type SearchResult } from "@/hooks/useSearch";

interface SearchPanelProps {
  onFileSelect: (filePath: string) => void;
}

export function SearchPanel({ onFileSelect }: SearchPanelProps) {
  const {
    query,
    setQuery,
    replaceQuery,
    setReplaceQuery,
    showReplace,
    setShowReplace,
    results,
    expandedFiles,
    caseSensitive,
    setCaseSensitive,
    useRegex,
    setUseRegex,
    wholeWord,
    setWholeWord,
    searchInputRef,
    toggleFileExpanded,
    handleResultClick,
    handleReplaceAll,
    totalMatches,
  } = useSearch();

  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center justify-between px-3 py-3 text-xs uppercase tracking-[0.2em] text-muted-foreground">
        Buscar
        <IconButton
          onClick={() => setShowReplace(!showReplace)}
          selected={showReplace}
          tooltip="Alternar substituir"
          className="size-3 p-3 rounded-lg"
        >
          <Replace />
        </IconButton>
      </div>

      <div className="px-3 pb-2 space-y-2">
        <InputWithActions
          ref={searchInputRef}
          autoFocus
          type="text"
          placeholder="Buscar..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          actions={
            <>
              <InputActionButton
                icon={CaseSensitive}
                active={caseSensitive}
                onClick={() => setCaseSensitive(!caseSensitive)}
                tooltip="Diferenciar maiúsculas de minúsculas"
              />
              <InputActionButton
                icon={WholeWord}
                active={wholeWord}
                onClick={() => setWholeWord(!wholeWord)}
                tooltip="Palavra inteira"
              />
              <InputActionButton
                icon={Regex}
                active={useRegex}
                onClick={() => setUseRegex(!useRegex)}
                tooltip="Usar Expressão Regular"
              />
            </>
          }
        />

        {/* Replace Input */}
        {showReplace && (
          <InputWithActions
            type="text"
            placeholder="Substituir..."
            value={replaceQuery}
            onChange={(e) => setReplaceQuery(e.target.value)}
            actions={
              <InputActionButton
                icon={ReplaceAll}
                onClick={handleReplaceAll}
                disabled={
                  !query.trim() || !replaceQuery || results.length === 0
                }
                tooltip="Substituir tudo"
              />
            }
          />
        )}

        {/* Results Count */}
        {query && (
          <div className="text-[10px] text-muted-foreground">
            {results.length} arquivo{results.length !== 1 ? "s" : ""} com{" "}
            {totalMatches} resultado{totalMatches !== 1 ? "s" : ""}
          </div>
        )}
      </div>
      <ResultsList
        results={results}
        query={query}
        expandedFiles={expandedFiles}
        toggleFileExpanded={toggleFileExpanded}
        handleResultClick={(filePath, line) =>
          handleResultClick(filePath, onFileSelect, line)
        }
      />
    </div>
  );
}

function ResultsList({
  results,
  query,
  expandedFiles,
  toggleFileExpanded,
  handleResultClick,
}: {
  results: SearchResult[];
  query: string;
  expandedFiles: Set<string>;
  toggleFileExpanded: (filePath: string) => void;
  handleResultClick: (filePath: string, line?: number) => void;
}) {
  return (
    <PerfectScrollbar axis="y" className="flex-1 overflow-auto px-2 pb-4">
      {results.length === 0 && query.trim() && (
        <div className="p-4 text-center text-xs text-muted-foreground">
          Nenhum resultado encontrado
        </div>
      )}

      {results.length === 0 && !query.trim() && (
        <div className="p-4 text-center text-xs text-muted-foreground">
          Digite para buscar nos arquivos
        </div>
      )}

      {results.map((result) => {
        const isExpanded = expandedFiles.has(result.filePath);
        const fileName = result.filePath.split("/").pop() || result.filePath;

        return (
          <div key={result.filePath} className="mb-1">
            {/* File Header */}
            <button
              onClick={() => toggleFileExpanded(result.filePath)}
              className="flex w-full items-center gap-2 rounded-md px-2 py-1 text-left text-xs transition-colors text-muted-foreground hover:text-foreground hover:bg-white/5"
            >
              <ChevronRight
                className={`h-3 w-3 transition-transform ${
                  isExpanded ? "rotate-90" : ""
                }`}
              />
              <span className="truncate flex-1">{fileName}</span>
              <span className="text-[10px] min-w-4 text-right">
                {result.matches.length}
              </span>
            </button>

            {/* Matches */}
            {isExpanded && (
              <div className="ml-5 mt-0.5 space-y-0.5">
                {result.matches.map((match, matchIndex) => (
                  <button
                    key={`${result.filePath}-${match.line}-${matchIndex}`}
                    onClick={() =>
                      handleResultClick(result.filePath, match.line)
                    }
                    className="flex w-full items-start gap-2 rounded-md px-2 py-1 text-left text-[11px] hover:bg-white/5 transition-colors group"
                  >
                    <span className="min-w-6 text-muted-foreground text-right">
                      {match.line + 1}
                    </span>
                    <span className="flex-1 truncate text-muted-foreground group-hover:text-foreground">
                      {match.content.substring(0, match.matchStart)}
                      <span className="bg-yellow-500/30 text-yellow-200">
                        {match.content.substring(
                          match.matchStart,
                          match.matchStart + query.length,
                        )}
                      </span>
                      {match.content.substring(match.matchStart + query.length)}
                    </span>
                  </button>
                ))}
              </div>
            )}
          </div>
        );
      })}
    </PerfectScrollbar>
  );
}
