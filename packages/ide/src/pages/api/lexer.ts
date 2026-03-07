import type { NextApiRequest, NextApiResponse } from "next";
import { Lexer } from "@ts-compilator-for-java/compiler/src/lexer";
import type {
  KeywordMap,
  LexerBlockDelimiters,
} from "@ts-compilator-for-java/compiler/src/lexer/config";
import {
  IssueDetails,
  IssueError,
} from "@ts-compilator-for-java/compiler/issue";
import { TToken } from "@/@types/token";
import { buildEffectiveKeywordMap } from "@/lib/keyword-map";
import type { IDEGrammarConfig } from "@/entities/compiler-config";

export type TLexerAnalyseData = {
  tokens: TToken[];
  warnings: IssueDetails[];
  infos: IssueDetails[];
  error: IssueDetails | null;
  message?: string;
};

export default function handler(
  req: NextApiRequest,
  res: NextApiResponse<TLexerAnalyseData>,
) {
  try {
    const keywordMap: KeywordMap | undefined = req.body.keywordMap;
    const blockDelimiters: LexerBlockDelimiters | undefined =
      req.body.blockDelimiters;
    const locale: string | undefined = req.body.locale;
    const indentationBlock: boolean | undefined = req.body.indentationBlock;
    const effectiveKeywordMap = buildEffectiveKeywordMap(keywordMap);
    const lexer = new Lexer(req.body.sourceCode, {
      customKeywords: effectiveKeywordMap,
      blockDelimiters,
      locale,
      indentationBlock,
    });
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
