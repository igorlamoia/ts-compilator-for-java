import type { TToken } from "@/@types/token";
import type { Instruction } from "@ts-compilator-for-java/compiler/interpreter/constants";
import type { IssueDetails } from "@ts-compilator-for-java/compiler/issue";

export type TLexerAnalyseData = {
  tokens: TToken[];
  warnings: IssueDetails[];
  infos: IssueDetails[];
  error: IssueDetails | null;
  message?: string;
};

export type TIntermediateCodeData = {
  instructions: Instruction[];
  warnings: IssueDetails[];
  infos: IssueDetails[];
  error: IssueDetails | null;
  message?: string;
};
