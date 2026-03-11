export const LOGICALS = {
  logical_or: 6, // ||
  logical_and: 7, // &&
  logical_not: 8, // !
};

export const LOGICAL_OPERATOR_TOKEN_IDS = {
  logical_or: LOGICALS.logical_or,
  logical_and: LOGICALS.logical_and,
  logical_not: LOGICALS.logical_not,
} as const;

export const LOGICALS_STYLE = {
  text: "text-yellow-500",
  bg: "bg-yellow-100 dark:bg-amber-900/55",
  border: "border-yellow-500",
  transform: "hover:bg-yellow-200",
};
