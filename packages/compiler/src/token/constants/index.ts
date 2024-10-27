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
  EOF: 99,
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

export {
  ARITHMETICS,
  LOGICALS,
  RELATIONALS,
  ASSIGNMENTS,
  RESERVEDS,
  SYMBOLS,
  LITERALS,
  ARITHMETICS_STYLE,
  ASSIGNMENTS_STYLE,
  LITERALS_STYLE,
  LOGICALS_STYLE,
  RELATIONALS_STYLE,
  RESERVEDS_STYLE,
  SYMBOLS_STYLE,
};