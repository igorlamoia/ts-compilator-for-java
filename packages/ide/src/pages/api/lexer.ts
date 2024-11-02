import type { NextApiRequest, NextApiResponse } from "next";
import { Lexer } from "@ts-compilator-for-java/compiler/src/lexer";
import {
  IssueDetails,
  IssueError,
} from "@ts-compilator-for-java/compiler/issue";
import { TToken } from "@/@types/token";

export type TLexerAnalyseData = {
  tokens: TToken[];
  warnings: IssueDetails[];
  infos: IssueDetails[];
  error: IssueDetails | null;
  message?: string;
};

export default function handler(
  req: NextApiRequest,
  res: NextApiResponse<TLexerAnalyseData>
) {
  try {
    const lexer = new Lexer(req.body.sourceCode);
    const tokens = lexer.scanTokens();
    res.status(200).json({
      message:
        "Lexical Analysis completed" +
        (lexer.warnings.length ? " with warnings" : ""),
      tokens,
      warnings: lexer.warnings,
      infos: lexer.infos,
      error: null,
    });
  } catch (error) {
    if (!(error instanceof IssueError)) {
      return res.status(500).json({
        tokens: [],
        warnings: [],
        infos: [],
        error: null,
        message: (error as Error).message || "Code not supported",
      });
    }

    res.status(400).json({
      message: error.message,
      tokens: [],
      warnings: [],
      infos: [],
      error: error.details,
    });
  }
}
