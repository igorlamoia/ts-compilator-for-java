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
import { t } from "@/i18n";
import { useRouter } from "next/router";

export function useIntermediatorCode() {
  const { showToast } = useToast();
  const { locale } = useRouter();
  // const [isLoading, setIsLoading] = useState(false);
  const { showLineIssues, cleanIssues } = useEditor();
  const [intermediateCode, setIntermediateCode] =
    useState<TIntermediateCodeData>({} as TIntermediateCodeData);
  const handleIntermediateCodeGeneration = async (
    tokens: TToken[],
  ): Promise<boolean> => {
    setIntermediateCode({} as TIntermediateCodeData);
    try {
      cleanIssues();
      const { data } = await api.post<TIntermediateCodeData>("/intermediator", {
        tokens: tokens,
        locale: locale,
      });
      const issues = [...data.warnings, ...data.infos];
      setIntermediateCode(data);
      showToast({
        message: t(locale, "toast.intermediate_completed"),
        type: issues.length ? "warning" : "success",
      });
      if (issues.length) handleIssues(issues);
      return true;
    } catch (error) {
      setIntermediateCode({} as TIntermediateCodeData);
      if (error instanceof AxiosError) {
        const { error: lexerError, message } = (error?.response?.data ||
          {}) as TIntermediateCodeData;
        if (lexerError) handleIssues([lexerError as IssueDetails], true);
        showToast({
          message: lexerError
            ? (lexerError as IssueDetails).message
            : message || t(locale, "toast.error_occurred"),
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
