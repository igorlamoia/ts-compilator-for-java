import { useContext, useState, useEffect, useRef } from "react";
import { EditorContext } from "@/contexts/EditorContext";
import {
  ChevronRight,
  Replace,
  CaseSensitive,
  Regex,
  WholeWord,
} from "lucide-react";
import { PerfectScrollbar } from "@/components/ui/perfect-scrollbar";

interface SearchResult {
  filePath: string;
  matches: {
    line: number;
    content: string;
    matchStart: number;
  }[];
}

interface SearchViewProps {
  onFileSelect: (filePath: string) => void;
}

export function SearchView({ onFileSelect }: SearchViewProps) {
  const editorContext = useContext(EditorContext);
  const { fileSystem } = editorContext;

  const [query, setQuery] = useState("");
  const [replaceQuery, setReplaceQuery] = useState("");
  const [showReplace, setShowReplace] = useState(false);
  const [results, setResults] = useState<SearchResult[]>([]);
  const [expandedFiles, setExpandedFiles] = useState<Set<string>>(new Set());
  const [caseSensitive, setCaseSensitive] = useState(false);
  const [useRegex, setUseRegex] = useState(false);
  const [wholeWord, setWholeWord] = useState(false);

  const searchInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      searchInputRef.current?.focus();
      searchInputRef.current?.select();
    }, 0);

    return () => window.clearTimeout(timer);
  }, []);

  // Search through all files
  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      return;
    }

    try {
      let searchPattern: RegExp | string = query;

      if (useRegex) {
        const flags = caseSensitive ? "g" : "gi";
        searchPattern = new RegExp(query, flags);
      } else if (wholeWord) {
        const flags = caseSensitive ? "g" : "gi";
        const escapedQuery = query.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
        searchPattern = new RegExp(`\\b${escapedQuery}\\b`, flags);
      }

      const searchResults: SearchResult[] = [];

      fileSystem.getAllFiles().forEach((file) => {
        const lines = file.content.split("\n");
        const matches: SearchResult["matches"] = [];

        lines.forEach((line, lineIndex) => {
          if (useRegex || wholeWord) {
            const regex = searchPattern as RegExp;
            let match;
            while ((match = regex.exec(line)) !== null) {
              matches.push({
                line: lineIndex,
                content: line,
                matchStart: match.index,
              });
            }
          } else {
            const searchTerm = caseSensitive ? query : query.toLowerCase();
            const lineToSearch = caseSensitive ? line : line.toLowerCase();

            let startIndex = 0;
            while (true) {
              const matchIndex = lineToSearch.indexOf(searchTerm, startIndex);
              if (matchIndex === -1) break;

              matches.push({
                line: lineIndex,
                content: line,
                matchStart: matchIndex,
              });

              startIndex = matchIndex + 1;
            }
          }
        });

        if (matches.length > 0) {
          searchResults.push({
            filePath: file.path,
            matches,
          });
        }
      });

      setResults(searchResults);
      setExpandedFiles(new Set());

      // Auto-expand first result
      if (searchResults.length > 0) {
        setExpandedFiles(new Set([searchResults[0].filePath]));
      }
    } catch {
      // Invalid regex or other error
      setResults([]);
    }
  }, [query, caseSensitive, useRegex, wholeWord, fileSystem]);

  const toggleFileExpanded = (filePath: string) => {
    setExpandedFiles((prev) => {
      const next = new Set(prev);
      if (next.has(filePath)) {
        next.delete(filePath);
      } else {
        next.add(filePath);
      }
      return next;
    });
  };

  const handleResultClick = (filePath: string, line?: number) => {
    onFileSelect(filePath);
    // TODO: Jump to line when monaco editor supports it
    void line;
  };

  const totalMatches = results.reduce((acc, r) => acc + r.matches.length, 0);

  return (
    <div className="flex h-full flex-col">
      {/* Header */}
      <div className="flex items-center justify-between px-3 py-3 text-xs uppercase tracking-[0.2em] text-muted-foreground">
        Buscar
        <button
          onClick={() => setShowReplace(!showReplace)}
          className="rounded p-1 hover:bg-white/10 transition-colors"
          title="Alternar substituir"
        >
          <Replace className="h-3.5 w-3.5" />
        </button>
      </div>

      {/* Search Input */}
      <div className="px-3 pb-2 space-y-2">
        <div className="relative">
          <input
            ref={searchInputRef}
            autoFocus
            type="text"
            placeholder="Buscar..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full rounded border border-white/10 bg-white/5 pl-3 pr-20 py-1.5 text-xs text-foreground outline-none transition-colors focus:border-white/30 focus:bg-white/10"
          />
          <div className="absolute right-1 top-1/2 -translate-y-1/2 flex items-center gap-0.5">
            <button
              onClick={() => setCaseSensitive(!caseSensitive)}
              className={`rounded p-1 text-xs transition-colors ${
                caseSensitive
                  ? "bg-white/20 text-foreground"
                  : "text-muted-foreground hover:bg-white/10"
              }`}
              title="Diferenciar maiúsculas de minúsculas"
            >
              <CaseSensitive className="h-3 w-3" />
            </button>
            <button
              onClick={() => setWholeWord(!wholeWord)}
              className={`rounded p-1 text-xs transition-colors ${
                wholeWord
                  ? "bg-white/20 text-foreground"
                  : "text-muted-foreground hover:bg-white/10"
              }`}
              title="Palavra inteira"
            >
              <WholeWord className="h-3 w-3" />
            </button>
            <button
              onClick={() => setUseRegex(!useRegex)}
              className={`rounded p-1 text-xs transition-colors ${
                useRegex
                  ? "bg-white/20 text-foreground"
                  : "text-muted-foreground hover:bg-white/10"
              }`}
              title="Usar Expressão Regular"
            >
              <Regex className="h-3 w-3" />
            </button>
          </div>
        </div>

        {/* Replace Input */}
        {showReplace && (
          <div className="relative">
            <input
              type="text"
              placeholder="Substituir..."
              value={replaceQuery}
              onChange={(e) => setReplaceQuery(e.target.value)}
              className="w-full rounded border border-white/10 bg-white/5 px-3 py-1.5 text-xs text-foreground outline-none transition-colors focus:border-white/30 focus:bg-white/10"
            />
          </div>
        )}

        {/* Results Count */}
        {query && (
          <div className="text-[10px] text-muted-foreground">
            {results.length} arquivo{results.length !== 1 ? "s" : ""} com{" "}
            {totalMatches} resultado{totalMatches !== 1 ? "s" : ""}
          </div>
        )}
      </div>

      {/* Results */}
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
                        {match.content.substring(
                          match.matchStart + query.length,
                        )}
                      </span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </PerfectScrollbar>
    </div>
  );
}
