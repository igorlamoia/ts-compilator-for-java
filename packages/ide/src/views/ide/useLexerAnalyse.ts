import type { MarkerSeverity } from "monaco-editor";
import { ESeverity, TLineAlert } from "@/@types/editor";
import { useEditor } from "@/hooks/useEditor";
import { TLexerAnalyseData } from "@/pages/api/lexer";
import { api } from "@/utils/axios";
import { useState } from "react";
import { IssueDetails } from "@ts-compilator-for-java/compiler/issue";
import { AxiosError } from "axios";
import { useToast } from "@/contexts/ToastContext";

export function useLexerAnalyse() {
  const { showToast } = useToast();
  // const [isLoading, setIsLoading] = useState(false);
  const { getEditorCode, showLineIssues, cleanIssues } = useEditor();
  const [analyseData, setAnalyseData] = useState<TLexerAnalyseData>(
    {} as TLexerAnalyseData
  );
  const handleRun = async () => {
    const code = getEditorCode();
    setAnalyseData({} as TLexerAnalyseData);
    try {
      cleanIssues();
      const { data } = await api.post<TLexerAnalyseData>("/lexer", {
        sourceCode: code,
      });
      const issues = [...data.warnings, ...data.infos];
      setAnalyseData(data);
      showToast({
        message: data.message || "Lexical Analysis completed",
        type: issues.length ? "warning" : "success",
      });
      window.scrollTo({
        top: 700,
        behavior: "smooth",
      });
      if (issues.length) handleIssues(issues);
    } catch (error) {
      setAnalyseData({} as TLexerAnalyseData);
      if (error instanceof AxiosError) {
        const { error: lexerError, message } = (error?.response?.data ||
          {}) as TLexerAnalyseData;
        handleIssues([lexerError as IssueDetails], true);
        return showToast({
          message: message || "An error occurred",
          type: "error",
        });
      }
      if (error instanceof Error)
        return showToast({
          message: error.message,
          type: "error",
        });
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
    analyseData,
    handleRun,
  };
}
