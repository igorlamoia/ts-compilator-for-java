import { OpName } from "../../interpreter/constants";

export const RELATIONALS = {
  equal_equal: 9, // ==
  not_equal: 10, // !=
  greater: 11, // >
  greater_equal: 12, // >=
  less: 13, // <
  less_equal: 14, // <=
};

export const RELATIONALS_STYLE = {
  text: "text-yellow-500",
  bg: "bg-yellow-100 dark:bg-amber-900/55",
  border: "border-yellow-500",
  transform: "hover:bg-yellow-200",
};

export const RELATIONAL_SYMBOLS: Record<number, OpName> = {
  [RELATIONALS.equal_equal]: "==",
  [RELATIONALS.not_equal]: "<>",
  [RELATIONALS.greater]: ">",
  [RELATIONALS.greater_equal]: "≥",
  [RELATIONALS.less]: "<",
  [RELATIONALS.less_equal]: "≤",
};
