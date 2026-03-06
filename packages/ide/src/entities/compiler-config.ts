export type IDESemicolonMode = "optional-eol" | "required";
export type IDEBlockMode = "delimited" | "indentation";

export type IDEGrammarConfig = {
  semicolonMode: IDESemicolonMode;
  blockMode: IDEBlockMode;
};

export type IDECompilerConfigPayload = {
  keywordMap: Record<string, number>;
  blockDelimiters?: { open: string; close: string };
  indentationBlock: boolean;
  grammar: IDEGrammarConfig;
};
