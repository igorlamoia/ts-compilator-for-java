export type TArithmetics = "+" | "-" | "*" | "/" | "%" | "//";
export type TUnaryArithmetics = "unary+" | "unary-";
export type TLogical = "||" | "&&" | "!";
export type TRelational = "==" | "<>" | ">" | "≥" | "<" | "≤";
export type TAssignment = "=";
export type TFlowControl = "IF" | "JUMP" | "RETURN";
export type TSystemCalls = "CALL"; // e.g. PRINT, SCAN
export type TLabel = "LABEL";
export type TDeclaration = "DECLARE";

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
  | TLabel
  | TDeclaration;

export interface Instruction {
  op: OpName;
  result: string;
  operand1: string | number | boolean | string[] | null;
  operand2: string | number | boolean | null;
}
