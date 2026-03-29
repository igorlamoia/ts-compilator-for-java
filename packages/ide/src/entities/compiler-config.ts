import { KeywordMapping } from "@/contexts/keyword/types";

export type IDESemicolonMode = "optional-eol" | "required";
export type IDEBlockMode = "delimited" | "indentation";
export type IDETypingMode = "typed" | "untyped";
export type IDEArrayMode = "fixed" | "dynamic";

export type IDEOperatorWordMap = {
  logical_or?: string;
  logical_and?: string;
  logical_not?: string;
  less?: string;
  less_equal?: string;
  greater?: string;
  greater_equal?: string;
  equal_equal?: string;
  not_equal?: string;
};

export type IDEBooleanLiteralMap = {
  true?: string;
  false?: string;
};

export type IDEGrammarConfig = {
  semicolonMode: IDESemicolonMode;
  blockMode: IDEBlockMode;
  typingMode: IDETypingMode;
  arrayMode: IDEArrayMode;
};

export type IDEKeywordCustomizationModes = {
  semicolon: IDESemicolonMode;
  block: IDEBlockMode;
  typing: IDETypingMode;
  array: IDEArrayMode;
};

export type IDEKeywordCustomizationState = {
  mappings: KeywordMapping[];
  operatorWordMap: IDEOperatorWordMap;
  booleanLiteralMap: IDEBooleanLiteralMap;
  statementTerminatorLexeme: string;
  blockDelimiters: { open: string; close: string };
  modes: IDEKeywordCustomizationModes;
};

export type IDECompilerConfigPayload = {
  keywordMap: Record<string, number>;
  operatorWordMap: IDEOperatorWordMap;
  booleanLiteralMap: IDEBooleanLiteralMap;
  statementTerminatorLexeme?: string;
  blockDelimiters?: { open: string; close: string };
  indentationBlock: boolean;
  grammar: IDEGrammarConfig;
};

export type IDEPartialCompilerConfigPayload = {
  keywordMap?: Record<string, number>;
  operatorWordMap?: IDEOperatorWordMap;
  booleanLiteralMap?: IDEBooleanLiteralMap;
  statementTerminatorLexeme?: string;
  blockDelimiters?: { open: string; close: string };
  indentationBlock?: boolean;
  grammar?: Partial<IDEGrammarConfig>;
};
