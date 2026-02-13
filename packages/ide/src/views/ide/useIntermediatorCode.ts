import type { MarkerSeverity } from "monaco-editor";
import { ESeverity, TLineAlert } from "@/@types/editor";
import { useEditor } from "@/hooks/useEditor";
import { TIntermediateCodeData } from "@/pages/api/intermediator";
import { api } from "@/utils/axios";
import { useState } from "react";
import { IssueDetails } from "@ts-compilator-for-java/compiler/issue";
import { AxiosError } from "axios";
import { useToast } from "@/contexts/ToastContext";
import { TToken } from "@/@types/token";

export function useIntermediatorCode() {
  const { showToast } = useToast();
  // const [isLoading, setIsLoading] = useState(false);
  const { showLineIssues, cleanIssues } = useEditor();
  const [intermediateCode, setIntermediateCode] =
    useState<TIntermediateCodeData>({} as TIntermediateCodeData);
  const handleIntermediateCodeGeneration = async (tokens: TToken[]) => {
    setIntermediateCode({} as TIntermediateCodeData);
    try {
      cleanIssues();
      const { data } = await api.post<TIntermediateCodeData>("/intermediator", {
        tokens: tokens,
      });
      const issues = [...data.warnings, ...data.infos];
      setIntermediateCode(data);
      showToast({
        message: data.message || "Intermediate code generation completed",
        type: issues.length ? "warning" : "success",
      });
      if (issues.length) handleIssues(issues);
    } catch (error) {
      setIntermediateCode({} as TIntermediateCodeData);
      if (error instanceof AxiosError) {
        const { error: lexerError, message } = (error?.response?.data ||
          {}) as TIntermediateCodeData;
        if (lexerError) handleIssues([lexerError as IssueDetails], true);
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
    intermediateCode,
    handleIntermediateCodeGeneration,
  };
}
