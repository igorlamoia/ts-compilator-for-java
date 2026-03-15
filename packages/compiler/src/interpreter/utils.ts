import { RuntimeSlot, ScanHint, TArithmetics, TRelational } from "./constants";

export function makeOperation(
  op: TArithmetics,
  val1: number,
  val2: number,
  throwError?: (code: string, params?: Record<string, unknown>) => never,
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
    if (throwError)
      throwError("interpreter.unknown_arithmetic_operator", { op });
    throw new Error(`Unknown arithmetic operator '${op}'`);
  }
  return computation;
}

export function makeRelation(
  op: TRelational,
  val1: number,
  val2: number,
  throwError?: (code: string, params?: Record<string, unknown>) => never,
) {
  const relations = {
    "==": val1 === val2,
    "<>": val1 !== val2,
    ">": val1 > val2,
    "≥": val1 >= val2,
    "<": val1 < val2,
    "≤": val1 <= val2,
  };
  const computation = relations[op] as boolean | undefined;
  if (computation === undefined) {
    if (throwError)
      throwError("interpreter.unknown_relational_operator", { op });
    throw new Error(`Unknown relational operator '${op}'`);
  }

  return computation;
}

export type TTypeOperand = string | number | boolean | null;

export function truncateTowardZero(value: number): number {
  return value < 0 ? Math.ceil(value) : Math.floor(value);
}

function normalizeBooleanLike(value: unknown): boolean {
  if (typeof value === "boolean") return value;
  if (typeof value === "number") return value !== 0;
  if (typeof value === "string") {
    const normalized = value.trim().toLowerCase();
    if (normalized === "true") return true;
    if (normalized === "false") return false;
  }
  return Boolean(value);
}

export function coerceValueForType(type: string, value: unknown): unknown {
  if (type === "int" && typeof value === "number") {
    return truncateTowardZero(value);
  }
  if (type === "float" && typeof value === "number") {
    return value;
  }
  if (type === "bool") {
    return normalizeBooleanLike(value);
  }
  return value;
}

export function parseOrGetVariable(
  operand: TTypeOperand,
  variables: Map<string, RuntimeSlot>,
  throwError?: (code: string, params?: Record<string, unknown>) => never,
): unknown {
  if (operand === null) return null;
  if (typeof operand === "boolean" || typeof operand === "number")
    return operand;
  if (typeof operand !== "string") {
    if (throwError) throwError("interpreter.invalid_operand_type", { operand });
    throw new Error(`Invalid operand type: ${operand}`);
  }

  const lower = operand.trim().toLowerCase();
  if (lower === "true") return true;
  else if (lower === "false") return false;

  const asNum = Number(operand);
  if (!Number.isNaN(asNum) && operand.trim() !== "") return asNum;

  if (!variables.has(operand)) {
    if (throwError) throwError("interpreter.variable_not_defined", { operand });
    throw new Error(`Variable '${operand}' has not been defined yet!`);
  }

  return variables.get(operand)?.value;
}

export function parsePiece(piece: string): string | number | boolean | null {
  piece = piece.trim();
  if (piece.startsWith("'") && piece.endsWith("'"))
    return piece.substring(1, piece.length - 1);
  if (piece === "None") return null;
  if (piece === "True") return true;
  if (piece === "False") return false;
  if (piece === "true") return true;
  if (piece === "false") return false;

  const asNumber = Number(piece);
  if (!Number.isNaN(asNumber) && piece !== "") return asNumber;

  return piece;
}

export function parseScanInput(hint: ScanHint, rawInput: string): unknown {
  const trimmed = rawInput.trim();

  if (hint === "int") {
    const parsed = Number.parseInt(trimmed, 10);
    return Number.isNaN(parsed) ? parsePiece(trimmed) : parsed;
  }

  if (hint === "float") {
    const parsed = Number.parseFloat(trimmed);
    return Number.isNaN(parsed) ? parsePiece(trimmed) : parsed;
  }

  return parsePiece(trimmed);
}
