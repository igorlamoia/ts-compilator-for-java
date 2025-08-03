export type TArithmetics = "+" | "-" | "*" | "/" | "%" | "//";
export type TUnaryArithmetics = "unary+" | "unary-";
export type TLogical = "||" | "&&" | "!";
export type TRelational = "==" | "<>" | ">" | "≥" | "<" | "≤";
export type TAssignment = "=";
export type TFlowControl = "IF" | "JUMP";
export type TSystemCalls = "CALL"; // e.g. PRINT, SCAN
export type TLabel = "LABEL";

export const ARITHMETICS: TArithmetics[] = ["+", "-", "*", "/", "%", "//"];
export const LOGICALS: TLogical[] = ["||", "&&", "!"];
export const RELATIONALS: TRelational[] = ["==", "<>", ">", "≥", "<", "≤"];

export type OpName =
  | TArithmetics
  | TUnaryArithmetics
  | TLogical
  | TRelational
  | TAssignment
  | TFlowControl
  | TSystemCalls
  | TLabel;

export interface Instruction {
  op: OpName;
  result: string;
  operand1: string | number | boolean | null;
  operand2: string | number | boolean | null;
}
