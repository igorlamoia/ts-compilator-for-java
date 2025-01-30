import { Tarithmetics, TRelational } from "./interpreter";

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
  const computation = operate[op] as number | undefined;

  if (computation === undefined) {
    throw new Error(`Unknown arithmetic operator '${op}'`);
  }
  return computation;
}

export function makeRelation(op: TRelational, val1: number, val2: number) {
  const relations = {
    "==": val1 === val2,
    "<>": val1 !== val2,
    ">": val1 > val2,
    "≥": val1 >= val2,
    "<": val1 < val2,
    "≤": val1 <= val2,
  };
  const computation = relations[op] as boolean | undefined;
  if (computation === undefined)
    throw new Error(`Unknown relational operator '${op}'`);

  return computation;
}
