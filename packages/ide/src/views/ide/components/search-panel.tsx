import { useContext, useState, useEffect, useRef } from "react";
import { EditorContext } from "@/contexts/EditorContext";
import { X, ChevronRight } from "lucide-react";

interface SearchResult {
  filePath: string;
  matches: {
    line: number;
    content: string;
    matchStart: number;
  }[];
}

interface SearchPanelProps {
  isOpen: boolean;
  onClose: () => void;
  onFileSelect: (filePath: string) => void;
}

export function SearchPanel({
  isOpen,
  onClose,
  onFileSelect,
}: SearchPanelProps) {
  const editorContext = useContext(EditorContext);
  const { fileSystem } = editorContext;

  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [selectedResultIndex, setSelectedResultIndex] = useState(0);
  const [expandedFiles, setExpandedFiles] = useState<Set<string>>(new Set());
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Focus search input when panel opens
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => searchInputRef.current?.focus(), 0);
    }
  }, [isOpen]);

  // Search through all files
  useEffect(() => {
    if (!query.trim() || !isOpen) {
      setResults([]);
      return;
    }

    const searchTerm = query.toLowerCase();
    const searchResults: SearchResult[] = [];

    fileSystem.getAllFiles().forEach((file) => {
      const lines = file.content.split("\n");

      const matches: SearchResult["matches"] = [];
      lines.forEach((line, lineIndex) => {
        let startIndex = 0;
        while (true) {
          const matchIndex = line
            .toLowerCase()
            .indexOf(searchTerm, startIndex);
          if (matchIndex === -1) break;

          matches.push({
            line: lineIndex,
            content: line,
            matchStart: matchIndex,
          });

          startIndex = matchIndex + 1;
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
    setSelectedResultIndex(0);
    setExpandedFiles(new Set());

    // Auto-expand first result
    if (searchResults.length > 0) {
      setExpandedFiles(new Set([searchResults[0].filePath]));
    }
  }, [query, isOpen, fileSystem]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Escape") {
      onClose();
      return;
    }

    if (e.key === "Enter" && results.length > 0) {
      const result = results[selectedResultIndex];
      if (result) {
        onFileSelect(result.filePath);
        onClose();
      }
    }

    if (e.key === "ArrowDown") {
      e.preventDefault();
      setSelectedResultIndex((prev) =>
        Math.min(prev + 1, results.length - 1),
      );
    }

    if (e.key === "ArrowUp") {
      e.preventDefault();
      setSelectedResultIndex((prev) => Math.max(prev - 1, 0));
    }
  };

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

  const handleResultClick = (filePath: string) => {
    onFileSelect(filePath);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center bg-black/40 pt-12 backdrop-blur-sm"
      onClick={() => onClose()}
    >
      <div
        className="w-full max-w-2xl rounded-lg border border-white/10 bg-neutral-900 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Search Input */}
        <div className="border-b border-white/10 p-4">
          <div className="relative">
            <input
              ref={searchInputRef}
              type="text"
              placeholder="Search files... (ESC to close)"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={handleKeyDown}
              className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-2 text-sm text-foreground outline-none transition-colors focus:border-white/30 focus:bg-white/10"
            />
            <button
              onClick={() => onClose()}
              className="absolute right-2 top-1/2 -translate-y-1/2 rounded p-1 text-muted-foreground hover:text-foreground"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
          <p className="mt-2 text-xs text-muted-foreground">
            {results.length} file{results.length !== 1 ? "s" : ""} with{" "}
            {results.reduce((acc, r) => acc + r.matches.length, 0)} match
            {results.reduce((acc, r) => acc + r.matches.length, 0) !== 1
              ? "es"
              : ""}
          </p>
        </div>

        {/* Results */}
        <div className="max-h-96 overflow-y-auto">
          {results.length === 0 && query.trim() && (
            <div className="p-8 text-center text-sm text-muted-foreground">
              No results found
            </div>
          )}

          {results.map((result, fileIndex) => {
            const isExpanded = expandedFiles.has(result.filePath);
            const isSelected = selectedResultIndex === fileIndex;

            return (
              <div key={result.filePath}>
                {/* File Header */}
                <button
                  onClick={() => toggleFileExpanded(result.filePath)}
                  className={`flex w-full items-center gap-2 px-4 py-2 text-left text-sm transition-colors ${
                    isSelected
                      ? "bg-white/10 text-foreground"
                      : "text-muted-foreground hover:text-foreground hover:bg-white/5"
                  }`}
                >
                  <ChevronRight
                    className={`h-4 w-4 transition-transform ${
                      isExpanded ? "rotate-90" : ""
                    }`}
                  />
                  <span className="font-mono text-xs">{result.filePath}</span>
                  <span className="ml-auto text-xs text-muted-foreground">
                    {result.matches.length}
                  </span>
                </button>

                {/* Matches */}
                {isExpanded && (
                  <div className="border-l border-white/5 ml-4">
                    {result.matches.map((match, matchIndex) => (
                      <button
                        key={`${result.filePath}-${match.line}-${matchIndex}`}
                        onClick={() => handleResultClick(result.filePath)}
                        className="flex w-full items-start gap-3 px-4 py-2 text-left text-xs hover:bg-white/5 transition-colors border-b border-white/5 last:border-b-0"
                      >
                        <span className="min-w-8 text-muted-foreground">
                          {match.line + 1}
                        </span>
                        <span className="line-clamp-2 wrap-break-word text-muted-foreground">
                          {match.content.substring(0, match.matchStart)}
                          <span className="bg-yellow-500/30 text-yellow-200 font-medium">
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
        </div>
      </div>
    </div>
  );
}
