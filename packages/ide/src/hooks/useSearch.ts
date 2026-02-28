import { useState, useEffect, useRef, useContext } from "react";
import { EditorContext } from "@/contexts/EditorContext";

export interface SearchResult {
  filePath: string;
  matches: {
    line: number;
    content: string;
    matchStart: number;
  }[];
}

export function useSearch() {
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

  // Auto-focus search input
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

  const handleResultClick = (
    filePath: string,
    onFileSelect: (path: string) => void,
    line?: number,
  ) => {
    onFileSelect(filePath);
    // TODO: Jump to line when monaco editor supports it
    void line;
  };

  const handleReplaceAll = () => {
    if (!query.trim() || !replaceQuery) return;

    results.forEach((result) => {
      const file = fileSystem.getFile(result.filePath);
      if (!file) return;

      let newContent = file.content;

      if (useRegex) {
        const flags = caseSensitive ? "g" : "gi";
        const regex = new RegExp(query, flags);
        newContent = newContent.replace(regex, replaceQuery);
      } else if (wholeWord) {
        const flags = caseSensitive ? "g" : "gi";
        const escapedQuery = query.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
        const regex = new RegExp(`\\b${escapedQuery}\\b`, flags);
        newContent = newContent.replace(regex, replaceQuery);
      } else {
        const lines = file.content.split("\n");
        newContent = lines
          .map((line) => {
            if (caseSensitive) {
              return line.replaceAll(query, replaceQuery);
            } else {
              const regex = new RegExp(
                query.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"),
                "gi",
              );
              return line.replace(regex, replaceQuery);
            }
          })
          .join("\n");
      }

      fileSystem.createOrUpdateFile(result.filePath, newContent, file.language);
    });

    // Trigger a new search to update results
    setQuery(query);
  };

  const totalMatches = results.reduce((acc, r) => acc + r.matches.length, 0);

  return {
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
  };
}
