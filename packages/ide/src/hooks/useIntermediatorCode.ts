import type { MarkerSeverity } from "monaco-editor";
import { ESeverity, TLineAlert } from "@/@types/editor";
import { useEditor } from "@/hooks/useEditor";
import { TIntermediateCodeData } from "@/types/compiler";
import { useState, useContext } from "react";
import { IssueDetails, IssueError } from "@ts-compilator-for-java/compiler/issue";
import { useToast } from "@/contexts/ToastContext";
import { EditorContext } from "@/contexts/editor/EditorContext";
import { TToken } from "@/@types/token";
import { t } from "@/i18n";
import { useRouter } from "next/router";
import { useKeywords } from "@/contexts/KeywordContext";
import { TokenIterator } from "@ts-compilator-for-java/compiler/token/TokenIterator";
import type { Token } from "@ts-compilator-for-java/compiler/token";
import type { IDEGrammarConfig } from "@/entities/compiler-config";
import type { OperatorWordMap } from "@ts-compilator-for-java/compiler/src/lexer/config";

type RunIntermediatorInput = {
  tokens: TToken[];
  locale?: string;
  grammar?: IDEGrammarConfig;
  operatorWordMap?: OperatorWordMap;
  statementTerminatorLexeme?: string;
};

async function runIntermediator(
  input: RunIntermediatorInput,
): Promise<TIntermediateCodeData> {
  try {
    const iterator = new TokenIterator(input.tokens as unknown as Token[], {
      locale: input.locale,
      grammar: input.grammar,
      operatorWordMap: input.operatorWordMap,
      statementTerminatorLexeme: input.statementTerminatorLexeme,
    });
    const instructions = iterator.generateIntermediateCode();
    const warnings =
      typeof iterator.getWarnings === "function" ? iterator.getWarnings() : [];
    const infos =
      typeof iterator.getInfos === "function" ? iterator.getInfos() : [];

    return {
      instructions,
      warnings,
      infos,
      error: null,
      message: "Intermediate code generation completed",
    };
  } catch (error) {
    if (error instanceof IssueError) throw error;
    throw new Error((error as Error).message || "Codigo nao suportado");
  }
}

export function useIntermediatorCode() {
  const { showToast } = useToast();
  const { locale } = useRouter();
  const { buildLexerConfig } = useKeywords();
  // const [isLoading, setIsLoading] = useState(false);
  const { showLineIssues, cleanIssues } = useEditor();
  const { currentFilePath, saveCurrentFile } = useContext(EditorContext);
  const [intermediateCode, setIntermediateCode] =
    useState<TIntermediateCodeData>({} as TIntermediateCodeData);
  const handleIntermediateCodeGeneration = async (
    tokens: TToken[],
  ): Promise<boolean> => {
    setIntermediateCode({} as TIntermediateCodeData);
    try {
      cleanIssues();
      const lexerConfig = buildLexerConfig();
      const data = await runIntermediator({
        tokens: tokens,
        locale: locale,
        grammar: lexerConfig.grammar,
        operatorWordMap: lexerConfig.operatorWordMap,
        statementTerminatorLexeme: lexerConfig.statementTerminatorLexeme,
      });
      const issues = [...data.warnings, ...data.infos];
      setIntermediateCode(data);
      showToast({
        message: t(locale, "toast.intermediate_completed"),
        type: issues.length ? "warning" : "success",
      });
      if (issues.length) handleIssues(issues);

      // Save the file after successful intermediate code generation
      if (currentFilePath) {
        saveCurrentFile(currentFilePath);
      }

      return true;
    } catch (error) {
      setIntermediateCode({} as TIntermediateCodeData);
      if (error instanceof IssueError) {
        const lexerError = error.details;
        if (lexerError) handleIssues([lexerError as IssueDetails], true);
        showToast({
          message: lexerError.message || t(locale, "toast.error_occurred"),
          type: "error",
        });
        return false;
      }
      if (error instanceof Error) {
        showToast({
          message: error.message,
          type: "error",
        });
      }
      return false;
    }
  };

  const handleIssues = (data: IssueDetails[], showDetails: boolean = false) => {
    const allLineIssues: TLineAlert[] = data.map((issue) => ({
      message: issue.message,
      startLineNumber: issue.line,
      endLineNumber: issue.line,
      startColumn: issue.column,
      endColumn: 100,
      severity: ESeverity[issue.type] as unknown as MarkerSeverity,
    }));
    showLineIssues(allLineIssues, showDetails);
  };

  return {
    intermediateCode,
    handleIntermediateCodeGeneration,
  };
}
