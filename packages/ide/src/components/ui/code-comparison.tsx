import { useEffect, useMemo, useState } from "react";
import { transformerNotationFocus } from "@shikijs/transformers";
import { FileIcon } from "lucide-react";
import { useTheme } from "@/contexts/ThemeContext";

import { cn } from "@/lib/utils";

interface CodeComparisonProps {
  beforeCode: string;
  afterCode: string;
  language?: string;
  filename: string;
  lightTheme: string;
  darkTheme: string;
  highlightColor?: string;
  beforeHighlightedHtml?: string;
  afterHighlightedHtml?: string;
  beforeFocusedLines?: number[];
  afterFocusedLines?: number[];
  beforeFocusedWords?: string[];
  afterFocusedWords?: string[];
}

type DiffRange = {
  start: number;
  end: number;
};

type DiffRangesByLine = Map<number, DiffRange[]>;

type DiffModel = {
  beforeRanges: DiffRangesByLine;
  afterRanges: DiffRangesByLine;
};

function addRange(
  rangesByLine: DiffRangesByLine,
  lineIndex: number,
  range: DiffRange,
) {
  if (range.end <= range.start) return;
  const current = rangesByLine.get(lineIndex) ?? [];
  current.push(range);
  rangesByLine.set(lineIndex, current);
}

function getChangedRangesForLinePair(
  beforeLine: string,
  afterLine: string,
): {
  beforeRange: DiffRange | null;
  afterRange: DiffRange | null;
} {
  if (beforeLine === afterLine) {
    return { beforeRange: null, afterRange: null };
  }

  const minLength = Math.min(beforeLine.length, afterLine.length);
  let start = 0;

  while (start < minLength && beforeLine[start] === afterLine[start]) {
    start += 1;
  }

  let beforeEnd = beforeLine.length - 1;
  let afterEnd = afterLine.length - 1;

  while (
    beforeEnd >= start &&
    afterEnd >= start &&
    beforeLine[beforeEnd] === afterLine[afterEnd]
  ) {
    beforeEnd -= 1;
    afterEnd -= 1;
  }

  return {
    beforeRange: beforeEnd + 1 > start ? { start, end: beforeEnd + 1 } : null,
    afterRange: afterEnd + 1 > start ? { start, end: afterEnd + 1 } : null,
  };
}

function computeDiffModel(beforeCode: string, afterCode: string): DiffModel {
  const beforeLines = beforeCode.split("\n");
  const afterLines = afterCode.split("\n");

  const rows = beforeLines.length;
  const cols = afterLines.length;
  const lcs = Array.from({ length: rows + 1 }, () =>
    Array<number>(cols + 1).fill(0),
  );

  for (let row = rows - 1; row >= 0; row -= 1) {
    for (let col = cols - 1; col >= 0; col -= 1) {
      if (beforeLines[row] === afterLines[col]) {
        lcs[row][col] = 1 + lcs[row + 1][col + 1];
      } else {
        lcs[row][col] = Math.max(lcs[row + 1][col], lcs[row][col + 1]);
      }
    }
  }

  const beforeRanges: DiffRangesByLine = new Map();
  const afterRanges: DiffRangesByLine = new Map();

  let row = 0;
  let col = 0;

  while (row < rows || col < cols) {
    if (row < rows && col < cols && beforeLines[row] === afterLines[col]) {
      row += 1;
      col += 1;
      continue;
    }

    const beforeBlock: number[] = [];
    const afterBlock: number[] = [];

    while (row < rows || col < cols) {
      if (row < rows && col < cols && beforeLines[row] === afterLines[col]) {
        break;
      }

      if (
        row < rows &&
        (col === cols || lcs[row + 1][col] >= lcs[row][col + 1])
      ) {
        beforeBlock.push(row);
        row += 1;
      } else if (col < cols) {
        afterBlock.push(col);
        col += 1;
      }
    }

    const pairedCount = Math.min(beforeBlock.length, afterBlock.length);

    for (let index = 0; index < pairedCount; index += 1) {
      const beforeLineIndex = beforeBlock[index];
      const afterLineIndex = afterBlock[index];
      const ranges = getChangedRangesForLinePair(
        beforeLines[beforeLineIndex],
        afterLines[afterLineIndex],
      );

      if (ranges.beforeRange) {
        addRange(beforeRanges, beforeLineIndex, ranges.beforeRange);
      }

      if (ranges.afterRange) {
        addRange(afterRanges, afterLineIndex, ranges.afterRange);
      }
    }

    for (let index = pairedCount; index < beforeBlock.length; index += 1) {
      const beforeLineIndex = beforeBlock[index];
      addRange(beforeRanges, beforeLineIndex, {
        start: 0,
        end: beforeLines[beforeLineIndex].length,
      });
    }

    for (let index = pairedCount; index < afterBlock.length; index += 1) {
      const afterLineIndex = afterBlock[index];
      addRange(afterRanges, afterLineIndex, {
        start: 0,
        end: afterLines[afterLineIndex].length,
      });
    }
  }

  return {
    beforeRanges,
    afterRanges,
  };
}

function ensureLineWrappedHighlighted(highlighted: string): string {
  if (highlighted.includes('class="line')) {
    return highlighted;
  }

  const lines = highlighted.split(/<br\s*\/?>|\r?\n/gi);
  const normalizedLines = lines.map((line) =>
    line.length > 0 ? line : "&nbsp;",
  );

  return `<pre><code>${normalizedLines
    .map((line) => `<span class="line">${line}</span>`)
    .join("")}</code></pre>`;
}

function wrapTextRange(
  lineElement: Element,
  range: DiffRange,
  className: string,
) {
  if (range.end <= range.start) return;

  const segments: Array<{ node: Text; start: number; end: number }> = [];
  const walker = lineElement.ownerDocument.createTreeWalker(
    lineElement,
    NodeFilter.SHOW_TEXT,
  );

  let currentOffset = 0;
  let currentNode = walker.nextNode();

  while (currentNode) {
    const node = currentNode as Text;
    const nodeStart = currentOffset;
    const nodeEnd = currentOffset + node.data.length;

    const overlapStart = Math.max(range.start, nodeStart);
    const overlapEnd = Math.min(range.end, nodeEnd);

    if (overlapStart < overlapEnd) {
      segments.push({
        node,
        start: overlapStart - nodeStart,
        end: overlapEnd - nodeStart,
      });
    }

    currentOffset = nodeEnd;
    currentNode = walker.nextNode();
  }

  for (let index = segments.length - 1; index >= 0; index -= 1) {
    const segment = segments[index];
    let targetNode = segment.node;

    if (segment.end < targetNode.data.length) {
      targetNode = targetNode.splitText(segment.end);
      targetNode = targetNode.previousSibling as Text;
    }

    if (segment.start > 0) {
      targetNode = targetNode.splitText(segment.start);
    }

    const wrapper = lineElement.ownerDocument.createElement("span");
    wrapper.className = className;
    targetNode.parentNode?.replaceChild(wrapper, targetNode);
    wrapper.appendChild(targetNode);
  }
}

function injectWordDiffClasses(
  highlighted: string,
  rangesByLine: DiffRangesByLine,
  className: string,
): string {
  if (!highlighted) return highlighted;

  const normalizedHighlighted = ensureLineWrappedHighlighted(highlighted);
  const parser = new DOMParser();
  const doc = parser.parseFromString(normalizedHighlighted, "text/html");
  const lineElements = Array.from(doc.querySelectorAll("pre code span.line"));

  lineElements.forEach((lineElement, lineIndex) => {
    const ranges = rangesByLine.get(lineIndex);
    if (!ranges || ranges.length === 0) return;

    for (const range of ranges) {
      wrapTextRange(lineElement, range, className);
    }
  });

  return doc.body.innerHTML;
}

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function injectFocusClasses(
  highlighted: string,
  focusedLines: number[] = [],
  focusedWords: string[] = [],
): string {
  if (!highlighted) return highlighted;

  const normalizedHighlighted = ensureLineWrappedHighlighted(highlighted);
  const parser = new DOMParser();
  const doc = parser.parseFromString(normalizedHighlighted, "text/html");
  const lineElements = Array.from(doc.querySelectorAll("pre code span.line"));

  const focusedLineSet = new Set(
    focusedLines
      .filter((lineNumber) => Number.isFinite(lineNumber) && lineNumber > 0)
      .map((lineNumber) => Math.floor(lineNumber) - 1),
  );

  const normalizedWords = focusedWords
    .map((word) => word.trim())
    .filter((word) => word.length > 0);

  lineElements.forEach((lineElement, lineIndex) => {
    if (focusedLineSet.has(lineIndex)) {
      lineElement.classList.add("focused");
      lineElement.classList.add("focused-line");
    }

    if (!normalizedWords.length) return;

    const lineText = lineElement.textContent ?? "";
    if (!lineText) return;

    const ranges: DiffRange[] = [];

    for (const word of normalizedWords) {
      const matcher = new RegExp(escapeRegExp(word), "gi");
      let match: RegExpExecArray | null = matcher.exec(lineText);

      while (match) {
        ranges.push({
          start: match.index,
          end: match.index + match[0].length,
        });
        match = matcher.exec(lineText);
      }
    }

    ranges.sort((left, right) => left.start - right.start);

    const mergedRanges: DiffRange[] = [];
    for (const range of ranges) {
      const last = mergedRanges[mergedRanges.length - 1];
      if (!last || range.start > last.end) {
        mergedRanges.push(range);
      } else {
        last.end = Math.max(last.end, range.end);
      }
    }

    for (
      let rangeIndex = mergedRanges.length - 1;
      rangeIndex >= 0;
      rangeIndex -= 1
    ) {
      wrapTextRange(lineElement, mergedRanges[rangeIndex], "focused");
    }

    if (mergedRanges.length) {
      lineElement.classList.add("focused-line");
    }
  });

  return doc.body.innerHTML;
}

export function CodeComparison({
  beforeCode,
  afterCode,
  language,
  filename,
  lightTheme,
  darkTheme,
  highlightColor = "#ff3333",
  beforeHighlightedHtml,
  afterHighlightedHtml,
  beforeFocusedLines,
  afterFocusedLines,
  beforeFocusedWords,
  afterFocusedWords,
}: CodeComparisonProps) {
  const { darkMode } = useTheme();
  const [highlighted, setHighlighted] = useState({
    before: "",
    after: "",
  });
  const [hasLeftFocus, setHasLeftFocus] = useState(false);
  const [hasRightFocus, setHasRightFocus] = useState(false);

  const selectedTheme = useMemo(() => {
    return darkMode ? darkTheme : lightTheme;
  }, [darkMode, darkTheme, lightTheme]);

  const diffModel = useMemo(
    () => computeDiffModel(beforeCode, afterCode),
    [beforeCode, afterCode],
  );

  useEffect(() => {
    if (beforeHighlightedHtml && afterHighlightedHtml) {
      setHighlighted({
        before: beforeHighlightedHtml,
        after: afterHighlightedHtml,
      });
    }
  }, [beforeHighlightedHtml, afterHighlightedHtml]);

  useEffect(() => {
    if (highlighted.before || highlighted.after) {
      setHasLeftFocus(
        highlighted.before.includes('class="line focused"') ||
          highlighted.before.includes('class="focused"'),
      );
      setHasRightFocus(
        highlighted.after.includes('class="line focused"') ||
          highlighted.after.includes('class="focused"'),
      );
    }
  }, [highlighted.before, highlighted.after]);

  useEffect(() => {
    async function highlightCode() {
      if (beforeHighlightedHtml && afterHighlightedHtml) {
        return;
      }

      try {
        const { codeToHtml } = await import("shiki");
        const { transformerNotationHighlight } =
          await import("@shikijs/transformers");

        const before = await codeToHtml(beforeCode, {
          lang: language ?? "java",
          theme: selectedTheme,
          transformers: [
            transformerNotationHighlight({ matchAlgorithm: "v3" }),
            transformerNotationFocus({ matchAlgorithm: "v3" }),
          ],
        });
        const after = await codeToHtml(afterCode, {
          lang: language ?? "java",
          theme: selectedTheme,
          transformers: [
            transformerNotationHighlight({ matchAlgorithm: "v3" }),
            transformerNotationFocus({ matchAlgorithm: "v3" }),
          ],
        });
        setHighlighted({ before, after });
      } catch (error) {
        console.error("Error highlighting code:", error);
        setHighlighted({
          before: `<pre>${beforeCode}</pre>`,
          after: `<pre>${afterCode}</pre>`,
        });
      }
    }
    highlightCode();
  }, [
    beforeCode,
    afterCode,
    language,
    selectedTheme,
    beforeHighlightedHtml,
    afterHighlightedHtml,
  ]);

  const renderCode = (
    code: string,
    highlighted: string,
    rangesByLine: DiffRangesByLine,
    diffClassName: "diff-word-add" | "diff-word-remove",
    blurredByDefault = false,
    focusedLines: number[] = [],
    focusedWords: string[] = [],
  ) => {
    if (highlighted) {
      const highlightedWithDiff = injectWordDiffClasses(
        highlighted,
        rangesByLine,
        diffClassName,
      );
      const highlightedWithFocus = injectFocusClasses(
        highlightedWithDiff,
        focusedLines,
        focusedWords,
      );

      return (
        <div
          style={{ "--highlight-color": highlightColor } as React.CSSProperties}
          className={cn(
            "bg-background h-full w-full overflow-auto font-mono text-xs",
            "[&>pre]:h-full [&>pre]:w-screen! [&>pre]:py-2",
            "[&>pre>code]:inline-block! [&>pre>code]:w-full!",
            "[&>pre>code>span]:inline-block! [&>pre>code>span]:w-full [&>pre>code>span]:px-4 [&>pre>code>span]:py-0.5",
            "[&>pre>code>.highlighted]:inline-block [&>pre>code>.highlighted]:w-full [&>pre>code>.highlighted]:bg-(--highlight-color)!",
            blurredByDefault &&
              "[&>pre>code>span.line:not(.focused):not(.focused-line)]:opacity-45 [&>pre>code>span.line:not(.focused):not(.focused-line)]:blur-[0.095rem] group-hover/left:[&>pre>code>span.line]:opacity-100 group-hover/left:[&>pre>code>span.line]:blur-none",
            "group-hover/left:[&>pre>code>:not(.focused)]:opacity-100! group-hover/left:[&>pre>code>:not(.focused)]:blur-none!",
            "group-hover/right:[&>pre>code>:not(.focused)]:opacity-100! group-hover/right:[&>pre>code>:not(.focused)]:blur-none!",
            "[&_.focused]:rounded-sm [&_.focused]:bg-[rgba(56,189,248,.24)] [&_.focused]:opacity-100! [&_.focused]:blur-none!",
            "[&_.diff-word-add]:rounded-sm [&_.diff-word-add]:bg-[rgba(16,185,129,.26)]",
            "[&_.diff-word-remove]:rounded-sm [&_.diff-word-remove]:bg-[rgba(244,63,94,.28)]",
            "group-hover/left:[&>pre>code>:not(.focused)]:transition-all group-hover/left:[&>pre>code>:not(.focused)]:duration-300",
            "group-hover/right:[&>pre>code>:not(.focused)]:transition-all group-hover/right:[&>pre>code>:not(.focused)]:duration-300",
          )}
          dangerouslySetInnerHTML={{ __html: highlightedWithFocus }}
        />
      );
    } else {
      return (
        <pre className="bg-background text-foreground h-full overflow-auto p-4 font-mono text-xs break-all">
          {code}
        </pre>
      );
    }
  };

  return (
    <div className="mx-auto w-full max-w-5xl">
      <div className="group border-border relative w-full overflow-hidden rounded-md border">
        <div className="relative grid md:grid-cols-2">
          <div
            className={cn(
              "leftside group/left dark:border-neutral-300/50 border-primary/20 md:border-r",
              hasLeftFocus &&
                "[&>div>pre>code>:not(.focused)]:opacity-50! [&>div>pre>code>:not(.focused)]:blur-[0.095rem]!",
              "[&>div>pre>code>:not(.focused)]:transition-all [&>div>pre>code>:not(.focused)]:duration-300",
            )}
          >
            <div className="dark:border-neutral-300/50 border-primary/20 bg-accent text-foreground flex items-center border-b p-2 text-sm">
              <FileIcon className="mr-2 h-4 w-4" />
              {filename}
              <span className="ml-auto hidden md:block">before</span>
            </div>
            {renderCode(
              beforeCode,
              highlighted.before,
              diffModel.beforeRanges,
              "diff-word-remove",
              true,
              beforeFocusedLines,
              beforeFocusedWords,
            )}
          </div>
          <div
            className={cn(
              "rightside group/right dark:border-neutral-300/50 border-primary/20 border-t md:border-t-0",
              hasRightFocus &&
                "[&>div>pre>code>:not(.focused)]:opacity-50! [&>div>pre>code>:not(.focused)]:blur-[0.095rem]!",
              "[&>div>pre>code>:not(.focused)]:transition-all [&>div>pre>code>:not(.focused)]:duration-300",
            )}
          >
            <div className="dark:border-neutral-300/50 border-primary/20 bg-accent text-foreground flex items-center border-b p-2 text-sm">
              <FileIcon className="mr-2 h-4 w-4" />
              {filename}
              <span className="ml-auto hidden md:block">after</span>
            </div>
            {renderCode(
              afterCode,
              highlighted.after,
              diffModel.afterRanges,
              "diff-word-add",
              false,
              afterFocusedLines,
              afterFocusedWords,
            )}
          </div>
        </div>
        <div className="dark:border-neutral-300/50 border-primary/20 bg-accent text-foreground absolute top-1/2 left-1/2 hidden h-8 w-8 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-md border text-xs md:flex">
          VS
        </div>
      </div>
    </div>
  );
}
