import { useEffect, useMemo, useState } from "react";
import loader from "@monaco-editor/loader";
import { useTheme } from "@/contexts/ThemeContext";
import { DarkTheme, LightTheme } from "@/contexts/editor/EditorThemes";
import {
  JAVAMM_LANGUAGE_ID,
  registerJavaMMLanguage,
} from "@/utils/compiler/editor/editor-language";
import { Terminal } from "@/components/ui/terminal";
import { useKeywordCustomizer } from "./keyword-customizer-context";

type ExampleSnippetProps = {
  title: string;
  code: string;
};

export function ExampleSnippet({ title, code }: ExampleSnippetProps) {
  const { darkMode } = useTheme();
  const { draftCustomization } = useKeywordCustomizer();
  const [highlightedCode, setHighlightedCode] = useState<string | null>(null);
  const lines = useMemo(() => code.split("\n"), [code]);

  useEffect(() => {
    let isCancelled = false;

    const colorizeSnippet = async () => {
      try {
        const monaco = await loader.init();

        monaco.editor.defineTheme("editor-glass-dark", DarkTheme);
        monaco.editor.defineTheme("editor-glass-light", LightTheme);

        registerJavaMMLanguage(monaco, draftCustomization.mappings, {
          blockMode: draftCustomization.modes.block,
          blockDelimiters: draftCustomization.blockDelimiters,
          operatorWordMap: draftCustomization.operatorWordMap,
          booleanLiteralMap: draftCustomization.booleanLiteralMap,
          languageDocumentation: draftCustomization.languageDocumentation,
          statementTerminatorLexeme:
            draftCustomization.statementTerminatorLexeme,
          typingMode: draftCustomization.modes.typing,
          arrayMode: draftCustomization.modes.array,
        });

        monaco.editor.setTheme(
          darkMode ? "editor-glass-dark" : "editor-glass-light",
        );

        const html = await monaco.editor.colorize(code, JAVAMM_LANGUAGE_ID, {
          tabSize: 2,
        });

        if (!isCancelled) {
          setHighlightedCode(html);
        }
      } catch {
        if (!isCancelled) {
          setHighlightedCode(null);
        }
      }
    };

    void colorizeSnippet();

    return () => {
      isCancelled = true;
    };
  }, [code, darkMode, draftCustomization]);

  return (
    <section className="space-y-2">
      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400">
        {title}
      </p>
      <Terminal
        sequence={false}
        className={`max-w-none overflow-hidden rounded-lg ${
          darkMode
            ? "border-slate-800 bg-slate-950"
            : "border-slate-200/80 bg-white"
        }`}
      >
        {highlightedCode ? (
          <span
            className={`font-mono text-xs leading-6 ${
              darkMode ? "text-cyan-100" : "text-slate-800"
            }`}
            dangerouslySetInnerHTML={{ __html: highlightedCode }}
          />
        ) : (
          lines.map((line, index) => (
            <span
              key={`${index}-${line}`}
              className={`font-mono text-xs leading-6 ${
                darkMode ? "text-cyan-100" : "text-slate-800"
              }`}
            >
              {line || " "}
            </span>
          ))
        )}
      </Terminal>
    </section>
  );
}
