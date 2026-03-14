import type { NextApiRequest, NextApiResponse } from "next";
import { IssueError } from "@ts-compilator-for-java/compiler/issue";
import type { IssueDetails } from "@ts-compilator-for-java/compiler/issue";
import { TokenIterator } from "@ts-compilator-for-java/compiler/token/TokenIterator";
import type { Token } from "@ts-compilator-for-java/compiler/token";
import type { Instruction } from "@ts-compilator-for-java/compiler/interpreter/constants";
import type { IDEGrammarConfig } from "@/entities/compiler-config";
import type { OperatorWordMap } from "@ts-compilator-for-java/compiler/src/lexer/config";

export type TIntermediateCodeData = {
  instructions: Instruction[];
  warnings: IssueDetails[];
  infos: IssueDetails[];
  error: IssueDetails | null;
  message?: string;
};

export default function handler(
  req: NextApiRequest,
  res: NextApiResponse<TIntermediateCodeData>,
) {
  try {
    const { tokens, locale, grammar } = req.body as {
      tokens: Token[];
      locale?: string;
      grammar?: IDEGrammarConfig;
      operatorWordMap?: OperatorWordMap;
    };
    const operatorWordMap = req.body.operatorWordMap as
      | OperatorWordMap
      | undefined;
    const iterator = new TokenIterator(tokens, {
      locale,
      grammar,
      operatorWordMap,
    });
    const instructions = iterator.generateIntermediateCode();
    const warnings =
      typeof iterator.getWarnings === "function" ? iterator.getWarnings() : [];
    const infos =
      typeof iterator.getInfos === "function" ? iterator.getInfos() : [];
    res.status(200).json({
      instructions,
      warnings,
      infos,
      error: null,
      message: "Intermediate code generation completed",
    });
  } catch (error) {
    if (!(error instanceof IssueError)) {
      return res.status(500).json({
        instructions: [],
        warnings: [],
        infos: [],
        error: null,
        message: (error as Error).message || 'Codigo nao suportado',
      })
    }
    res
      .status(400)
      .json({
        message: error.message,
        instructions: [],
        warnings: [],
        infos: [],
        error: error.details,
      });
  }
}
