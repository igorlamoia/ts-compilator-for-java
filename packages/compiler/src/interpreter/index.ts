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

  constructor(
    program: Instruction[],
    io: {
      stdout: (msg: string) => void;
      stdin: () => Promise<string>;
    },
  ) {
    this.stdout = io.stdout;
    this.stdin = io.stdin;
    this.program = program;
    this.labels = new Map<string, number>();
    this.variables = new Map<string, unknown>();
    this.callStack = [];
    this.instructionPointer = 0;
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
        throw new Error(`Label '${labelName}' defined more than once!`);
      this.labels.set(labelName, index);
    });

    // Segundo passo: iniciar execução no label 'main'
    if (!this.labels.has("main")) {
      throw new Error("No 'main' function found!");
    }
    this.instructionPointer = this.getLabelIndex("main");

    while (this.reading()) {
      const { op, result, operand1, operand2 } =
        this.program[this.instructionPointer];
      if (op === "CALL" && result === "STOP") break;
      if (op === "LABEL") {
        this.instructionPointer++;
        continue;
      } else if (ARITHMETICS.includes(op as TArithmetics)) {
        if (operand2 !== null) {
          const val1 = this.parseOrGetVariableWithScope(operand1);
          const val2 = this.parseOrGetVariableWithScope(operand2);

          if (typeof val1 !== "number" || typeof val2 !== "number")
            throw new Error(
              `Arithmetic operation '${op}' requires numeric operands. between '${val1}' and '${val2}'`,
            );

          this.setVariable(
            result,
            makeOperation(op as TArithmetics, val1, val2),
          );
        } else {
          const val1 = this.parseOrGetVariableWithScope(operand1);
          if (typeof val1 !== "number")
            throw new Error(
              `Unary arithmetic operation '${op}' requires a numeric operand. Received '${val1}'`,
            );

          if (op === "+") this.setVariable(result, +val1);
          else if (op === "-") this.setVariable(result, -val1);
          else throw new Error(`Invalid unary arithmetic operator '${op}'`);
        }
        this.instructionPointer++;
      } else if (op === "unary+" || op === "unary-") {
        const val1 = this.parseOrGetVariableWithScope(operand1);
        if (typeof val1 !== "number")
          throw new Error(
            `Unary operation '${op}' requires numeric operand. Received '${val1}'`,
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
          makeRelation(op as TRelational, val1 as number, val2 as number),
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
          throw new Error(
            `IF requires label names as operand1/operand2. Received '${labelTrue}' and '${labelFalse}'`,
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
            throw new Error(
              `SCAN requires a string variable name as operand1. Received '${operand2}'`,
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
          throw new Error(
            `DECLARE requires a string variable name as result. Received '${result}'`,
          );

        // Se estivermos em uma função e houver argumentos avaliados, atribuir aos parâmetros
        let initialValue: unknown = null;
        if (this.callStack.length > 0) {
          const frame = this.callStack[this.callStack.length - 1];
          const evaluatedArgs = (frame as any).evaluatedArgs as unknown[];

          if (evaluatedArgs && frame.parameters.length < evaluatedArgs.length) {
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
        throw new Error(
          `Unknown operation '${op}' at Instruction Pointer = ${this.instructionPointer}`,
        );
    }
  }

  private getLabelIndex(label: string): number {
    if (!this.labels.has(label))
      throw new Error(
        `Label '${label}' not found! Available labels: ${[...this.labels.keys()].join(", ")}`,
      );
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

    throw new Error(
      `Variable '${name}' not found. Available variables: ${[...this.variables.keys()].join(", ")}`,
    );
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
