import promptSync from "prompt-sync";
import { makeOperation, makeRelation } from "../utils";
const prompt = promptSync();

export type Tarithmetics = "+" | "-" | "*" | "/" | "%" | "//";
export type TUnaryArithmetics = "unary+" | "unary-";
export type TLogical = "||" | "&&" | "!";
export type TRelational = "==" | "<>" | ">" | "≥" | "<" | "≤";
export type Tassignment = "=";
export type TflowControl = "IF" | "JUMP";
export type TsystemCalls = "CALL"; // e.g. PRINT, SCAN
export type Tlabel = "LABEL";

const arithmetics: Tarithmetics[] = ["+", "-", "*", "/", "%", "//"];
const logicals: TLogical[] = ["||", "&&", "!"];
const relationals: TRelational[] = ["==", "<>", ">", "≥", "<", "≤"];

export type OpName =
  | Tarithmetics
  | TUnaryArithmetics
  | TLogical
  | TRelational
  | Tassignment
  | TflowControl
  | TsystemCalls
  | Tlabel;

export interface Instruction {
  op: OpName;
  result: string; // or special meaning (condition var, label name, etc.)
  operand1: string | number | boolean | null; // (either a literal, a variable name, or possibly a label).
  operand2: string | number | boolean | null;
}

/**
 * A helper function that attempts to interpret an operand as:
 *  - null -> returns null
 *  - boolean (true/false) -> returns boolean
 *  - numeric literal (int/float) -> number
 *  - otherwise string -> treat it as a variable name and fetch from 'variables'
 *
 * Raises an Error if the operand is not found in 'variables' when we
 * assume it is a variable name.
 */
function parseOperand(
  operand: string | number | boolean | null,
  variables: Map<string, unknown>
): unknown {
  if (operand === null) {
    return null;
  }

  // If operand is already boolean or number, just return it.
  if (typeof operand === "boolean" || typeof operand === "number") {
    return operand;
  }

  // If operand is a string, let's see if it's a numeric literal or 'true'/'false'
  if (typeof operand === "string") {
    // check booleans
    const lower = operand.trim().toLowerCase();
    if (lower === "true") {
      return true;
    } else if (lower === "false") {
      return false;
    }

    // check if numeric
    const asNum = Number(operand);
    if (!Number.isNaN(asNum) && operand.trim() !== "") {
      // It's a valid number
      return asNum;
    }

    // otherwise, treat as a variable name
    if (!variables.has(operand)) {
      throw new Error(`Variable '${operand}' has not been defined yet!`);
    }
    return variables.get(operand);
  }

  // Should never get here if all cases above are handled
  throw new Error(`Invalid operand type: ${operand}`);
}

/**
 * The main interpreter function.
 * @param program - The list of instructions (the "bytecode") to execute
 */
export function interpret(program: Instruction[]): void {
  const labels = new Map<string, number>();
  function getLabelIndex(label: string): number {
    if (!labels.has(label)) throw new Error(`Label '${label}' not found!`);

    return labels.get(label)!;
  }
  program.forEach((instr, idx) => {
    if (instr.op === "LABEL") {
      const labelName = instr.result;
      if (labels.has(labelName)) {
        throw new Error(`Label '${labelName}' defined more than once!`);
      }
      labels.set(labelName, idx);
    }
  });

  const variables = new Map<string, unknown>();
  let instructionPointer = 0; // Instruction pointer

  while (instructionPointer >= 0 && instructionPointer < program.length) {
    const { op, result, operand1, operand2 } = program[instructionPointer];

    if (op === "LABEL") {
      instructionPointer++;
      continue;
    }

    // -- Arithmetic / Unary Arithmetic
    if (arithmetics.includes(op as Tarithmetics)) {
      // Distinguish unary vs binary by operand2 presence
      if (operand2 !== null) {
        // binary
        const val1 = parseOperand(operand1, variables);
        const val2 = parseOperand(operand2, variables);

        if (typeof val1 !== "number" || typeof val2 !== "number") {
          throw new Error(
            `Arithmetic operation '${op}' requires numeric operands.`
          );
        }

        variables.set(result, makeOperation(op as Tarithmetics, val1, val2));
      } else {
        // unary
        const val1 = parseOperand(operand1, variables);
        if (typeof val1 !== "number") {
          throw new Error(
            `Unary arithmetic operation '${op}' requires a numeric operand.`
          );
        }
        if (op === "+") {
          variables.set(result, +val1); // unary plus
        } else if (op === "-") {
          variables.set(result, -val1); // unary minus
        } else {
          throw new Error(`Invalid unary arithmetic operator '${op}'`);
        }
      }
      instructionPointer++;
    }

    // If you prefer to treat unary +, unary - as separate "op" tokens:
    else if (op === "unary+" || op === "unary-") {
      // Just an example if you want them separated from the usual +, -
      const val1 = parseOperand(operand1, variables);
      if (typeof val1 !== "number") {
        throw new Error(`Unary operation '${op}' requires numeric operand.`);
      }
      variables.set(result, op === "unary+" ? +val1 : -val1);
      instructionPointer++;
    }

    // -- Logical Operators
    else if (logicals.includes(op as TLogical)) {
      if (op === "!") {
        // unary NOT
        const val1 = parseOperand(operand1, variables);
        variables.set(result, !Boolean(val1));
      } else {
        // binary (||, &&)
        const val1 = Boolean(parseOperand(operand1, variables));
        const val2 = Boolean(parseOperand(operand2, variables));
        let out: boolean;
        if (op === "||") {
          out = val1 || val2;
        } else {
          // &&
          out = val1 && val2;
        }
        variables.set(result, out);
      }
      instructionPointer++;
    }

    // -- Relational Operators
    else if (relationals.includes(op as TRelational)) {
      const val1 = parseOperand(operand1, variables);
      const val2 = parseOperand(operand2, variables);
      variables.set(
        result,
        makeRelation(op as TRelational, val1 as number, val2 as number)
      );

      instructionPointer++;
    }

    // -- Assignment
    else if (op === "=") {
      // result = operand1
      const val1 = parseOperand(operand1, variables);
      variables.set(result, val1);
      instructionPointer++;
    }

    // -- Flow control: IF
    else if (op === "IF") {
      // ( "IF", conditionVar, labelTrue, labelFalse )
      // In our structure: op=IF, result=conditionVar, operand1=labelTrue, operand2=labelFalse
      const conditionVal = parseOperand(result, variables);
      const labelTrue = operand1;
      const labelFalse = operand2;

      if (typeof labelTrue !== "string" || typeof labelFalse !== "string") {
        throw new Error(`IF requires label names as operand1/operand2`);
      }
      if (Boolean(conditionVal)) {
        instructionPointer = getLabelIndex(labelTrue);
      } else {
        instructionPointer = getLabelIndex(labelFalse);
      }
    }

    // -- Flow control: JUMP
    else if (op === "JUMP") {
      // ( "JUMP", label, null, null )
      const labelName = result;
      instructionPointer = getLabelIndex(labelName);
    }

    // -- System calls: CALL PRINT / CALL SCAN
    else if (op === "CALL") {
      // e.g. ( "CALL", "PRINT", "x", null )
      // or ( "CALL", "SCAN", "someVar", null )
      const callType = result.toUpperCase();
      if (callType === "PRINT") {
        // const valueToPrint = parseOperand(operand1, variables);
        console.log(operand1 ?? operand2);
      } else if (callType === "SCAN") {
        // operand1 should be variable name
        if (typeof operand2 !== "string") {
          throw new Error(`SCAN requires a string variable name as operand1`);
        }
        const userInput = prompt("Enter a value: ");
        // Decide if you want to parse as number, boolean, etc.
        // For simplicity, store as string:
        variables.set(operand2, userInput);
      } else {
        throw new Error(`Unknown system call '${callType}'`);
      }
      instructionPointer++;
    } else {
      // no match
      throw new Error(`Unknown operation '${op}' at IP=${instructionPointer}`);
    }
  }
}
