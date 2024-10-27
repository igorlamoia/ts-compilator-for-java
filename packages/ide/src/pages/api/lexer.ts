// Import the Lexer class from the compiler package
import { Lexer } from "@ts-compilator-for-java/compiler/src/lexer";
// Example usage in a Next.js API route
import { TToken } from "@/@types/token";
import type { NextApiRequest, NextApiResponse } from "next";

type Data = {
  tokens: TToken[];
};

export default function handler(
  req: NextApiRequest,
  res: NextApiResponse<Data>
) {
  const lexer = new Lexer(req.body.sourceCode);
  const tokens = lexer.scanTokens();
  res.status(200).json({ tokens });
}
