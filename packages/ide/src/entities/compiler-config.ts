export type IDESemicolonMode = "optional-eol" | "required";
export type IDEBlockMode = "delimited" | "indentation";
export type IDETypingMode = "typed" | "untyped";

export type IDEGrammarConfig = {
  semicolonMode: IDESemicolonMode;
  blockMode: IDEBlockMode;
  typingMode: IDETypingMode;
};

export type IDECompilerConfigPayload = {
  keywordMap: Record<string, number>;
  blockDelimiters?: { open: string; close: string };
  indentationBlock: boolean;
  grammar: IDEGrammarConfig;
};

export type IDEPartialCompilerConfigPayload = {
  keywordMap?: Record<string, number>;
  blockDelimiters?: { open: string; close: string };
  indentationBlock?: boolean;
  grammar?: Partial<IDEGrammarConfig>;
};
