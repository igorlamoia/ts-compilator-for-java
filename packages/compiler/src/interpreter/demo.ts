import { Interpreter } from "./";
import { Instruction } from "./constants";
import promptSync from "prompt-sync";

export function demo() {
  const demoProgram: Instruction[] = [
    // (op, result, operand1, operand2)
    // ('=', 'numBloco_0', 0, None),
    // ('=', 'divBloco_0', 0, None),
    // ('=', 'restoBloco_0', 0, None),
    // ('CALL', 'PRINT', 'Entre com o inteiro: ', None),
    // ('CALL', 'SCAN', None, 'numBloco_0'),
    // ('CALL', 'PRINT', None, 'numBloco_0'),
    { op: "=", result: "numBloco_0", operand1: 0, operand2: null },
    {
      op: "CALL",
      result: "PRINT",
      operand1: "Entre com o inteiro: ",
      operand2: null,
    },
    { op: "CALL", result: "SCAN", operand1: null, operand2: "numBloco_0" },
    { op: "CALL", result: "PRINT", operand1: null, operand2: "numBloco_0" },
  ];
  const prompt = promptSync();
  const io = {
    stdout: (msg: string) => process.stdout.write(msg),
    stdin: async () => prompt(""),
  };
  new Interpreter(demoProgram, io).execute();
}
