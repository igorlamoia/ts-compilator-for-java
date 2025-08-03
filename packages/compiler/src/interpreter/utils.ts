import { TArithmetics, TRelational } from "./constants";

export function makeOperation(
  op: TArithmetics,
  val1: number,
  val2: number
): number {
  const operate = {
    "+": val1 + val2,
    "-": val1 - val2,
    "*": val1 * val2,
    "/": val1 / val2,
    "//": Math.floor(val1 / val2),
    "%": val1 % val2,
  };
  const computation = operate[op] as number | undefined;

  if (computation === undefined) {
    throw new Error(`Unknown arithmetic operator '${op}'`);
  }
  return computation;
}

export function makeRelation(op: TRelational, val1: number, val2: number) {
  const relations = {
    "==": val1 === val2,
    "<>": val1 !== val2,
    ">": val1 > val2,
    "≥": val1 >= val2,
    "<": val1 < val2,
    "≤": val1 <= val2,
  };
  const computation = relations[op] as boolean | undefined;
  if (computation === undefined)
    throw new Error(`Unknown relational operator '${op}'`);

  return computation;
}

export type TTypeOperand = string | number | boolean | null;

export function parseOrGetVariable(
  operand: TTypeOperand,
  variables: Map<string, unknown>
): unknown {
  if (operand === null) return null;
  if (typeof operand === "boolean" || typeof operand === "number")
    return operand;
  if (typeof operand !== "string")
    throw new Error(`Invalid operand type: ${operand}`);

  const lower = operand.trim().toLowerCase();
  if (lower === "true") return true;
  else if (lower === "false") return false;

  const asNum = Number(operand);
  if (!Number.isNaN(asNum) && operand.trim() !== "") return asNum;

  if (!variables.has(operand))
    throw new Error(`Variable '${operand}' has not been defined yet!`);

  return variables.get(operand);
}

export function parsePiece(piece: string): string | number | boolean | null {
  piece = piece.trim();
  if (piece.startsWith("'") && piece.endsWith("'"))
    return piece.substring(1, piece.length - 1);
  if (piece === "None") return null;
  if (piece === "True") return true;
  if (piece === "False") return false;

  const asNumber = Number(piece);
  if (!Number.isNaN(asNumber) && piece !== "") return asNumber;

  return piece;
}
