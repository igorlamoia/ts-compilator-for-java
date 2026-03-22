import type { NextApiRequest, NextApiResponse } from "next";
import { Lexer } from "@ts-compilator-for-java/compiler/src/lexer";
import type {
  KeywordMap,
  LexerBlockDelimiters,
  OperatorWordMap,
} from "@ts-compilator-for-java/compiler/src/lexer/config";
import {
  IssueDetails,
  IssueError,
} from "@ts-compilator-for-java/compiler/issue";
import { buildEffectiveKeywordMap } from "@/lib/keyword-map";
import { TLexerAnalyseData } from "@/types/compiler";

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
    const operatorWordMap: OperatorWordMap | undefined =
      req.body.operatorWordMap;
    const effectiveKeywordMap = buildEffectiveKeywordMap(keywordMap);
    const lexer = new Lexer(req.body.sourceCode, {
      customKeywords: effectiveKeywordMap,
      operatorWordMap,
      blockDelimiters,
      locale,
      indentationBlock,
    });
    const tokens = lexer.scanTokens();
    const warnings = lexer.warnings;
    const infos = lexer.infos;
    res.status(200).json({
      message:
        "Lexical Analysis completed" +
        (warnings.length ? " with warnings" : ""),
      tokens,
      warnings,
      infos,
      error: null,
    });
  } catch (error) {
    if (!(error instanceof IssueError)) {
      return res.status(500).json({
        tokens: [],
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
        tokens: [],
        warnings: [],
        infos: [],
        error: error.details,
      });
  }
}
