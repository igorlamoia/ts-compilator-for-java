/************************************************************
 * parseInstructions.ts
 *
 * Example: A function to read a .txt file with lines like:
 *    ('=', 'numBloco_0', 0, None),
 *    ('CALL', 'PRINT', 'Entre com o inteiro: ', None),
 * and convert them into Instruction objects for the interpreter.
 ************************************************************/

import { Instruction, OpName } from "./";

/**
 * Represents one instruction in our IR (op code, result, operand1, operand2).
 * Adjust as needed for your project.
 */
// export interface Instruction {
//   op: string;
//   result: string; // or special meaning for "IF"/"JUMP", etc.
//   operand1: string | number | boolean | null;
//   operand2: string | number | boolean | null;
// }

/**
 * Parse a single line in the format:
 *   ('=', 'numBloco_0', 0, None),
 *   ('CALL', 'PRINT', 'Entre com o inteiro:', None),
 *
 * into an Instruction object.
 * Returns null if the line is empty or doesn't parse correctly.
 */
function parseLineToInstruction(line: string): Instruction | null {
  // Trim whitespace
  line = line.trim();
  if (!line) return null; // skip blank lines

  // Remove a trailing comma if present
  if (line.endsWith(",")) {
    line = line.substring(0, line.length - 1).trim();
  }

  // Remove leading '(' and trailing ')' if present
  if (line.startsWith("(")) {
    line = line.substring(1).trim();
  }
  if (line.endsWith(")")) {
    line = line.substring(0, line.length - 1).trim();
  }

  // Now we expect something like:
  //   "'='", "'numBloco_0'", '0', 'None'
  // Split by commas at the top level:
  const parts = line.split(",");
  if (parts.length < 4) {
    // Not a valid 4-tuple
    return null;
  }

  // Helper to parse each piece
  function parsePiece(piece: string): string | number | boolean | null {
    piece = piece.trim();

    // If it's wrapped in quotes (e.g. "'someString'"), remove them
    if (piece.startsWith("'") && piece.endsWith("'")) {
      return piece.substring(1, piece.length - 1);
    }

    // Check for Python's None -> our null
    if (piece === "None") {
      return null;
    }

    // Check for boolean-like strings "True"/"False" if needed
    if (piece === "True") {
      return true;
    }
    if (piece === "False") {
      return false;
    }

    // Attempt to parse numeric
    const asNumber = Number(piece);
    if (!Number.isNaN(asNumber) && piece !== "") {
      return asNumber;
    }

    // Otherwise, treat it as a raw string (e.g., a variable name)
    return piece;
  }

  // Extract the first four pieces
  const [rawOp, rawResult, rawOperand1, rawOperand2, ...rest] = parts;
  const op = parsePiece(rawOp) as OpName;
  const result = parsePiece(rawResult) as string;
  const operand1 = parsePiece(rawOperand1);
  const operand2 = parsePiece(rawOperand2);

  return {
    op,
    result,
    operand1,
    operand2,
  };
}

/**
 * Reads a text file line by line, parses each line as an Instruction.
 * Skips empty lines. Returns an array of Instructions.
 * @param filePath the path to the .txt file containing the tuple lines
 */
export function loadInstructionsFromTxt(fileContent: string): Instruction[] {
  const lines = fileContent.split("\n");

  const instructions: Instruction[] = [];

  for (const line of lines) {
    const instr = parseLineToInstruction(line);
    if (instr) {
      instructions.push(instr);
    }
  }

  return instructions;
}

/**************************************************************
 * Example usage (uncomment if you want to test directly):
 **************************************************************/
// if (require.main === module) {
//   const filePath = "teste.txt"; // your file path
//   const program = loadInstructionsFromTxt(filePath);
//   console.log("Parsed instructions:\n", program);
// }
