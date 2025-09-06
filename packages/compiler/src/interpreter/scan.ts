import { Instruction, OpName } from "./constants";
import { parsePiece } from "./utils";

export function loadInstructionsFromString(fileContent: string): Instruction[] {
  const lines = fileContent.split("\n");

  const instructions: Instruction[] = [];

  for (const line of lines) {
    const instr = parseLineToInstruction(line);
    if (instr) instructions.push(instr);
  }

  return instructions;
}

function parseLineToInstruction(line: string): Instruction | null {
  line = line.trim();
  if (!line) return null;
  if (line.endsWith(",")) line = line.substring(0, line.length - 1).trim();
  if (line.startsWith("(")) line = line.substring(1).trim();
  if (line.endsWith(")")) line = line.substring(0, line.length - 1).trim();

  const parts = line.match(/('[^']*'|[^',\s]+)(?=\s*,|\s*$)/g);
  if (!parts || parts.length < 4) return null; // Invalid instruction

  const [rawOp, rawResult, rawOperand1, rawOperand2] = parts;
  const op = parsePiece(rawOp) as OpName;
  const result = parsePiece(rawResult) as string;
  const operand1 = parsePiece(rawOperand1);
  const operand2 = parsePiece(rawOperand2);

  return { op, result, operand1, operand2 };
}
