import { makeOperation, makeRelation, parsePiece } from "./utils";
import {
  ARITHMETICS,
  Instruction,
  LOGICALS,
  RELATIONALS,
  TArithmetics,
  TLogical,
  TRelational,
} from "./constants";
import { RuntimeError } from "./runtime-error";
import { translate } from "../i18n";

interface CallFrame {
  returnAddress: number;
  returnVariable: string | null;
  localScope: Map<string, unknown>;
  parameters: string[];
}

export class Interpreter {
  private labels: Map<string, number>;
  private variables: Map<string, unknown>;
  private callStack: CallFrame[];
  private instructionPointer: number;
  private program: Instruction[];

  private stdout: (msg: string) => void;
  private stdin: () => Promise<string>;
  private locale: string | undefined;

  constructor(
    program: Instruction[],
    io: {
      stdout: (msg: string) => void;
      stdin: () => Promise<string>;
    },
    locale?: string,
  ) {
    this.stdout = io.stdout;
    this.stdin = io.stdin;
    this.program = program;
    this.labels = new Map<string, number>();
    this.variables = new Map<string, unknown>();
    this.callStack = [];
    this.instructionPointer = 0;
    this.locale = locale;
  }

  private getFallbackInstruction(): Instruction {
    return {
      op: "CALL",
      result: "STOP",
      operand1: null,
      operand2: null,
    };
  }

  private getCurrentInstruction(): Instruction {
    return (
      this.program[this.instructionPointer] ?? this.getFallbackInstruction()
    );
  }

  private buildErrorCallStack(
    pointer: number = this.instructionPointer,
  ): Instruction[] {
    return this.program.slice(0, Math.max(0, pointer));
  }

  private toRuntimeError(
    error: unknown,
    instruction: Instruction,
    pointer: number = this.instructionPointer,
  ): RuntimeError {
    if (error instanceof RuntimeError) return error;
    const code = "interpreter.runtime_error";
    const message = error instanceof Error ? error.message : "Runtime error";
    return new RuntimeError(
      code,
      message,
      instruction,
      pointer,
      this.buildErrorCallStack(pointer),
    );
  }

  private throwRuntimeError(
    code: string,
    params?: Record<string, string | number | boolean | unknown>,
    instruction: Instruction = this.getCurrentInstruction(),
    pointer: number = this.instructionPointer,
  ): never {
    const message = translate(this.locale, code, params);
    throw new RuntimeError(
      code,
      message,
      instruction,
      pointer,
      this.buildErrorCallStack(pointer),
    );
  }

  public async execute(commandRef = { current: "" }): Promise<void> {
    this.labels.clear();
    this.variables.clear();
    this.callStack = [];
    this.instructionPointer = 0;

    // console.log(this.program);

    // Primeiro passo: mapear todos os labels
    this.program.forEach((instruction, index) => {
      if (instruction.op !== "LABEL") return;
      const labelName = instruction.result;
      if (this.labels.has(labelName))
        this.throwRuntimeError(
          "interpreter.label_defined_multiple_times",
          { labelName },
          instruction,
          index,
        );
      this.labels.set(labelName, index);
    });

    // Segundo passo: iniciar execução no label 'main'
    if (!this.labels.has("main")) {
      this.throwRuntimeError(
        "interpreter.no_main_function",
        undefined,
        this.getFallbackInstruction(),
        0,
      );
    }
    this.instructionPointer = this.getLabelIndex("main");

    while (this.reading()) {
      const currentInstruction = this.getCurrentInstruction();
      const { op, result, operand1, operand2 } = currentInstruction;

      try {
        if (op === "CALL" && result === "STOP") break;
        if (op === "LABEL") {
          this.instructionPointer++;
          continue;
        } else if (ARITHMETICS.includes(op as TArithmetics)) {
          if (operand2 !== null) {
            const val1 = this.parseOrGetVariableWithScope(operand1);
            const val2 = this.parseOrGetVariableWithScope(operand2);

            if (typeof val1 !== "number" || typeof val2 !== "number")
              this.throwRuntimeError(
                "interpreter.arithmetic_requires_numeric",
                { op, val1, val2 },
                currentInstruction,
              );

            this.setVariable(
              result,
              makeOperation(op as TArithmetics, val1, val2, (code, params) =>
                this.throwRuntimeError(code, params, currentInstruction),
              ),
            );
          } else {
            const val1 = this.parseOrGetVariableWithScope(operand1);
            if (typeof val1 !== "number")
              this.throwRuntimeError(
                "interpreter.unary_arithmetic_requires_numeric",
                { op, val1 },
                currentInstruction,
              );

            if (op === "+") this.setVariable(result, +val1);
            else if (op === "-") this.setVariable(result, -val1);
            else
              this.throwRuntimeError(
                "interpreter.invalid_unary_operator",
                { op },
                currentInstruction,
              );
          }
          this.instructionPointer++;
        } else if (op === "unary+" || op === "unary-") {
          const val1 = this.parseOrGetVariableWithScope(operand1);
          if (typeof val1 !== "number")
            this.throwRuntimeError(
              "interpreter.unary_operation_requires_numeric",
              { op, val1 },
              currentInstruction,
            );
          this.setVariable(result, op === "unary+" ? +val1 : -val1);
          this.instructionPointer++;
        } else if (LOGICALS.includes(op as TLogical)) {
          if (op === "!") {
            const val1 = this.parseOrGetVariableWithScope(operand1);
            this.setVariable(result, !Boolean(val1));
          } else {
            const val1 = Boolean(this.parseOrGetVariableWithScope(operand1));
            const val2 = Boolean(this.parseOrGetVariableWithScope(operand2));
            let out: boolean;
            if (op === "||") out = val1 || val2;
            else out = val1 && val2;
            this.setVariable(result, out);
          }
          this.instructionPointer++;
        } else if (RELATIONALS.includes(op as TRelational)) {
          const val1 = this.parseOrGetVariableWithScope(operand1);
          const val2 = this.parseOrGetVariableWithScope(operand2);
          this.setVariable(
            result,
            makeRelation(
              op as TRelational,
              val1 as number,
              val2 as number,
              (code, params) =>
                this.throwRuntimeError(code, params, currentInstruction),
            ),
          );
          this.instructionPointer++;
        } else if (op === "=") {
          const val1 = this.parseOrGetVariableWithScope(operand1);
          this.setVariable(result, val1);
          this.instructionPointer++;
        } else if (op === "IF") {
          const conditionVal = this.parseOrGetVariableWithScope(result);
          const labelTrue = operand1;
          const labelFalse = operand2;

          if (typeof labelTrue !== "string" || typeof labelFalse !== "string")
            this.throwRuntimeError(
              "interpreter.if_requires_labels",
              { labelTrue, labelFalse },
              currentInstruction,
            );

          if (Boolean(conditionVal))
            this.instructionPointer = this.getLabelIndex(labelTrue);
          else this.instructionPointer = this.getLabelIndex(labelFalse);
        } else if (op === "JUMP") {
          const labelName = result;
          this.instructionPointer = this.getLabelIndex(labelName);
        } else if (op === "CALL") {
          const callType = result.toUpperCase();
          if (callType === "PRINT") {
            let output = String(
              operand1 ?? this.parseOrGetVariableWithScope(operand2),
            );
            // Remove surrounding double quotes from string literals
            if (output.startsWith('"') && output.endsWith('"')) {
              output = output.slice(1, -1);
            }
            this.stdout(output.replace(/\\n/g, "\r\n"));
            this.instructionPointer++;
          } else if (callType === "SCAN") {
            if (typeof operand2 !== "string")
              this.throwRuntimeError(
                "interpreter.scan_requires_string_variable",
                { operand2 },
                currentInstruction,
              );

            const userInput = await this.stdin();
            console.log("userInput", userInput);
            commandRef.current = "";
            this.setVariable(operand2, parsePiece(userInput));
            this.instructionPointer++;
          } else if (callType === "STOP") {
            break;
          } else {
            // Chamada de função definida pelo usuário
            const functionName = result;
            const args = operand1 as string[];
            const returnVar = operand2 as string;

            // Avaliar argumentos no escopo atual
            const evaluatedArgs = args
              ? args.map((arg) => this.parseOrGetVariableWithScope(arg))
              : [];

            // Criar novo frame para a função
            const frame: CallFrame = {
              returnAddress: this.instructionPointer + 1,
              returnVariable: returnVar,
              localScope: new Map<string, unknown>(),
              parameters: [],
            };

            this.callStack.push(frame);

            // Pular para a função
            this.instructionPointer = this.getLabelIndex(functionName);

            // Os parâmetros serão inicializados pelas instruções DECLARE da função
            // e depois precisam receber os valores dos argumentos
            // Vamos armazenar os argumentos avaliados temporariamente
            (frame as any).evaluatedArgs = evaluatedArgs;
          }
        } else if (op === "DECLARE") {
          if (typeof result !== "string")
            this.throwRuntimeError(
              "interpreter.declare_requires_string",
              { result },
              currentInstruction,
            );

          // Se estivermos em uma função e houver argumentos avaliados, atribuir aos parâmetros
          let initialValue: unknown = null;
          if (this.callStack.length > 0) {
            const frame = this.callStack[this.callStack.length - 1];
            const evaluatedArgs = (frame as any).evaluatedArgs as unknown[];

            if (
              evaluatedArgs &&
              frame.parameters.length < evaluatedArgs.length
            ) {
              // Usar o valor do argumento como valor inicial
              initialValue = evaluatedArgs[frame.parameters.length];
              frame.parameters.push(result);
            }
          }

          // Declarar variável no escopo atual com o valor inicial
          this.setVariable(result, initialValue);

          this.instructionPointer++;
          continue;
        } else if (op === "RETURN") {
          const returnValue = this.parseOrGetVariableWithScope(result);

          if (this.callStack.length === 0) {
            // Return do main - terminar execução
            return;
          }

          // Pop do call stack
          const frame = this.callStack.pop()!;

          // Armazenar valor de retorno no escopo do caller se houver variável
          if (frame.returnVariable) {
            const callerScope = this.getCurrentScope();
            callerScope.set(frame.returnVariable, returnValue);
          }

          // Voltar para endereço de retorno
          this.instructionPointer = frame.returnAddress;
        } else
          this.throwRuntimeError(
            "interpreter.unknown_operation",
            { op, instructionPointer: this.instructionPointer },
            currentInstruction,
          );
      } catch (error) {
        throw this.toRuntimeError(error, currentInstruction);
      }
    }
  }

  private getLabelIndex(label: string): number {
    if (!this.labels.has(label))
      this.throwRuntimeError("interpreter.label_not_found", {
        label,
        availableLabels: [...this.labels.keys()].join(", "),
      });
    return this.labels.get(label)!;
  }

  private reading(): boolean {
    return (
      this.instructionPointer >= 0 &&
      this.instructionPointer < this.program.length
    );
  }

  private getCurrentScope(): Map<string, unknown> {
    if (this.callStack.length > 0) {
      return this.callStack[this.callStack.length - 1].localScope;
    }
    return this.variables; // escopo global
  }

  private getVariable(name: string): unknown {
    // Procurar no escopo local primeiro
    if (this.callStack.length > 0) {
      const currentScope = this.callStack[this.callStack.length - 1].localScope;
      if (currentScope.has(name)) {
        return currentScope.get(name);
      }
    }

    // Se não encontrar, procurar no escopo global
    if (this.variables.has(name)) {
      return this.variables.get(name);
    }

    this.throwRuntimeError("interpreter.variable_not_found", {
      name,
      availableVariables: [...this.variables.keys()].join(", "),
    });
  }

  private setVariable(name: string, value: unknown): void {
    const currentScope = this.getCurrentScope();
    currentScope.set(name, value);
  }

  private parseOrGetVariableWithScope(value: unknown): unknown {
    if (typeof value === "string") {
      // Tentar parsear como número
      if (/^-?\d+(\.\d+)?$/.test(value)) {
        return Number(value);
      }
      // Tentar obter variável
      try {
        return this.getVariable(value);
      } catch {
        // Se não for variável, retornar como string
        return value;
      }
    }
    return value;
  }
}

export { RuntimeError } from "./runtime-error";
