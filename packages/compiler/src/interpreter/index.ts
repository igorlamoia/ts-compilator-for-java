import promptSync from "prompt-sync";
import {
  makeOperation,
  makeRelation,
  parseOrGetVariable,
  parsePiece,
  TTypeOperand,
} from "./utils";
import {
  ARITHMETICS,
  Instruction,
  LOGICALS,
  RELATIONALS,
  TArithmetics,
  TLogical,
  TRelational,
} from "./constants";

const prompt = promptSync();

export class Interpreter {
  private labels: Map<string, number>;
  private variables: Map<string, unknown>;
  private instructionPointer: number;
  private program: Instruction[];

  constructor(program: Instruction[]) {
    this.program = program;
    this.labels = new Map<string, number>();
    this.variables = new Map<string, unknown>();
    this.instructionPointer = 0;
  }

  public execute(): void {
    this.labels.clear();
    this.variables.clear();
    this.instructionPointer = 0;

    this.program.forEach((instruction, index) => {
      if (instruction.op !== "LABEL") return;
      const labelName = instruction.result;
      if (this.labels.has(labelName))
        throw new Error(`Label '${labelName}' defined more than once!`);
      this.labels.set(labelName, index);
    });

    while (this.reading()) {
      const { op, result, operand1, operand2 } =
        this.program[this.instructionPointer];
      if (op === "CALL" && result === "STOP") break;

      if (op === "LABEL") {
        this.instructionPointer++;
        continue;
      }

      if (ARITHMETICS.includes(op as TArithmetics)) {
        if (operand2 !== null) {
          const val1 = parseOrGetVariable(operand1, this.variables);
          const val2 = parseOrGetVariable(operand2, this.variables);

          if (typeof val1 !== "number" || typeof val2 !== "number")
            throw new Error(
              `Arithmetic operation '${op}' requires numeric operands.`
            );

          this.variables.set(
            result,
            makeOperation(op as TArithmetics, val1, val2)
          );
        } else {
          const val1 = parseOrGetVariable(operand1, this.variables);
          if (typeof val1 !== "number")
            throw new Error(
              `Unary arithmetic operation '${op}' requires a numeric operand.`
            );

          if (op === "+") this.variables.set(result, +val1);
          else if (op === "-") this.variables.set(result, -val1);
          else throw new Error(`Invalid unary arithmetic operator '${op}'`);
        }
        this.instructionPointer++;
      } else if (op === "unary+" || op === "unary-") {
        const val1 = parseOrGetVariable(operand1, this.variables);
        if (typeof val1 !== "number")
          throw new Error(`Unary operation '${op}' requires numeric operand.`);
        this.variables.set(result, op === "unary+" ? +val1 : -val1);
        this.instructionPointer++;
      } else if (LOGICALS.includes(op as TLogical)) {
        if (op === "!") {
          const val1 = parseOrGetVariable(operand1, this.variables);
          this.variables.set(result, !Boolean(val1));
        } else {
          const val1 = Boolean(parseOrGetVariable(operand1, this.variables));
          const val2 = Boolean(parseOrGetVariable(operand2, this.variables));
          let out: boolean;
          if (op === "||") out = val1 || val2;
          else out = val1 && val2;
          this.variables.set(result, out);
        }
        this.instructionPointer++;
      } else if (RELATIONALS.includes(op as TRelational)) {
        const val1 = parseOrGetVariable(operand1, this.variables);
        const val2 = parseOrGetVariable(operand2, this.variables);
        this.variables.set(
          result,
          makeRelation(op as TRelational, val1 as number, val2 as number)
        );
        this.instructionPointer++;
      } else if (op === "=") {
        const val1 = parseOrGetVariable(operand1, this.variables);
        this.variables.set(result, val1);
        this.instructionPointer++;
      } else if (op === "IF") {
        const conditionVal = parseOrGetVariable(result, this.variables);
        const labelTrue = operand1;
        const labelFalse = operand2;

        if (typeof labelTrue !== "string" || typeof labelFalse !== "string")
          throw new Error(`IF requires label names as operand1/operand2`);

        if (Boolean(conditionVal))
          this.instructionPointer = this.getLabelIndex(labelTrue);
        else this.instructionPointer = this.getLabelIndex(labelFalse);
      } else if (op === "JUMP") {
        const labelName = result;
        this.instructionPointer = this.getLabelIndex(labelName);
      } else if (op === "CALL") {
        const callType = result.toUpperCase();
        if (callType === "PRINT") {
          if (operand1 === "\\n") {
            console.log();
            this.instructionPointer++;
            continue;
          }
          console.log(operand1 ?? parseOrGetVariable(operand2, this.variables));
        } else if (callType === "SCAN") {
          if (typeof operand2 !== "string")
            throw new Error(`SCAN requires a string variable name as operand1`);

          const userInput = prompt("Enter a value: ");
          this.variables.set(operand2, parsePiece(userInput));
        } else throw new Error(`Unknown system call '${callType}'`);

        this.instructionPointer++;
      } else
        throw new Error(
          `Unknown operation '${op}' at IP=${this.instructionPointer}`
        );
    }
  }

  private getLabelIndex(label: string): number {
    if (!this.labels.has(label)) throw new Error(`Label '${label}' not found!`);
    return this.labels.get(label)!;
  }

  private reading(): boolean {
    return (
      this.instructionPointer >= 0 &&
      this.instructionPointer < this.program.length
    );
  }
}
