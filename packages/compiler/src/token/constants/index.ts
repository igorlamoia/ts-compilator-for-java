import { ARITHMETICS, ARITHMETICS_STYLE } from "./arithmetics";
import { ASSIGNMENTS, ASSIGNMENTS_STYLE } from "./assignments";
import { LITERALS, LITERALS_STYLE } from "./literals";
import { LOGICALS, LOGICALS_STYLE } from "./logicals";
import { RELATIONALS, RELATIONALS_STYLE } from "./relationals";
import { RESERVEDS, RESERVEDS_STYLE } from "./reserveds";
import { SYMBOLS, SYMBOLS_STYLE } from "./symbols";

export const TOKENS = {
  ARITHMETICS,
  LOGICALS,
  RELATIONALS,
  ASSIGNMENTS,
  RESERVEDS,
  SYMBOLS,
  LITERALS,
};

export const TOKENS_STYLE = {
  ARITHMETICS_STYLE,
  ASSIGNMENTS_STYLE,
  LITERALS_STYLE,
  LOGICALS_STYLE,
  RELATIONALS_STYLE,
  RESERVEDS_STYLE,
  SYMBOLS_STYLE,
};

export const TOKENS_DESCRIPTION_TO_ID = {
  ...ARITHMETICS,
  ...LOGICALS,
  ...RELATIONALS,
  ...ASSIGNMENTS,
  ...RESERVEDS,
  ...SYMBOLS,
  ...LITERALS,
};

export const TOKENS_ID_TO_DESCRIPTION = Object.entries(
  TOKENS_DESCRIPTION_TO_ID
).reduce((acc, [key, value]) => {
  acc[value] = key;
  return acc;
}, {} as Record<number, string>);
