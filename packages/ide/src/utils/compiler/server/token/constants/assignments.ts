export const ASSIGNMENTS = {
  equal: 15, // =
  plus_equal: 16, // +=
  minus_equal: 17, // -=
  star_equal: 18, // *=
  slash_equal: 19, // /=
  modulo_equal: 20, // %=
};

export const ASSIGNMENTS_TYPES = {
  [ASSIGNMENTS.equal]: "equal",
  [ASSIGNMENTS.plus_equal]: "plus_equal",
  [ASSIGNMENTS.minus_equal]: "minus_equal",
  [ASSIGNMENTS.star_equal]: "star_equal",
  [ASSIGNMENTS.slash_equal]: "slash_equal",
  [ASSIGNMENTS.modulo_equal]: "modulo_equal",
};

export const ASSIGNMENTS_STYLE = {
  text: "bg-green-500",
  bg: "bg-green-100",
  border: "border-green-500",
  transform: "hover:bg-green-200",
};
