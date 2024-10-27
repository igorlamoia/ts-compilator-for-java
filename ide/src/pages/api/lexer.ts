// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from "next";

type Data = {
  tokens: any[];
};

export default function handler(
  req: NextApiRequest,
  res: NextApiResponse<Data>
) {
  // const lexer = new Lexer(req.sourceCode);
  // const tokens = lexer.scanTokens();
  res.status(200).json({ tokens: [] });
}
