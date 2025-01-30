import { Tarithmetics } from "./interpreter";

export function makeOperation(
  op: Tarithmetics,
  val1: number,
  val2: number
): number {
  const operate = {
    "+": val1 + val2,
    "-": val1 - val2,
    "*": val1 * val2,
    "/": val1 / val2,
    "//": Math.floor(val1 / val2),
    "%": val1 % val2,
  };
  const computation = operate[op] as unknown as any;

  if (computation === undefined) {
    throw new Error(`Unknown arithmetic operator '${op}'`);
  }
  return computation;
}
