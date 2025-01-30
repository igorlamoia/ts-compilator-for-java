import { Instruction, interpret } from "./interpreter";

export function demo() {
  // Example "program"
  const demoProgram: Instruction[] = [
    // (op, result, operand1, operand2)
    { op: "=", result: "x", operand1: 10, operand2: null }, // x = 10
    { op: "CALL", result: "PRINT", operand1: "x", operand2: null }, // print(x)
    { op: "-", result: "x", operand1: "x", operand2: 1 }, // x = x - 1
    { op: "CALL", result: "PRINT", operand1: "x", operand2: null }, // print(x)
    { op: "IF", result: "x", operand1: "LOOP", operand2: "END" }, // if x != 0 => jump "LOOP", else "END"
    { op: "LABEL", result: "LOOP", operand1: null, operand2: null },
    { op: "-", result: "x", operand1: "x", operand2: 1 },
    { op: "CALL", result: "PRINT", operand1: "x", operand2: null },
    // repeat the IF
    { op: "IF", result: "x", operand1: "LOOP", operand2: "END" },
    { op: "LABEL", result: "END", operand1: null, operand2: null },
  ];

  interpret(demoProgram);
}
