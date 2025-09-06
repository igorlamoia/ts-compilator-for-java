import { Instruction, OpName } from "../interpreter/constants";

export class Emitter {
  private instructions: Instruction[] = [];
  private tempCounter = 0;
  private labelCounter = 0;

  emit(op: OpName, result: string, operand1: any, operand2: any) {
    this.instructions.push({ op, result, operand1, operand2 });
  }

  newTemp(): string {
    return `__temp${this.tempCounter++}`;
  }

  newLabel(): string {
    return `__label${this.labelCounter++}`;
  }

  getInstructions(): Instruction[] {
    return this.instructions;
  }
}
