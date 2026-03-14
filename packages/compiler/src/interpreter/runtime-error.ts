import { Instruction, OpName } from "./constants";

export class RuntimeError extends Error {
  code: string;
  instruction: {
    op: OpName;
    result: string;
    operand1: Instruction["operand1"];
    operand2: Instruction["operand2"];
  };
  errorCallStack: Instruction[];
  instructionPointer: number;

  constructor(
    code: string,
    message: string,
    instruction: Instruction,
    instructionPointer: number,
    errorCallStack: Instruction[],
  ) {
    super(message);
    this.name = "RuntimeError";
    this.code = code;
    this.instruction = {
      op: instruction.op,
      result: instruction.result,
      operand1: instruction.operand1,
      operand2: instruction.operand2,
    };
    this.errorCallStack = errorCallStack;
    this.instructionPointer = instructionPointer;
  }
}
