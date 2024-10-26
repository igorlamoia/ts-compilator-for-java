import { ARITHMETICS } from "./arithmetics";
import { ASSIGNMENTS } from "./assignments";
import { LITERALS } from "./literals";
import { LOGICALS } from "./logicals";
import { RELATIONALS } from "./relationals";
import { RESERVEDS } from "./reserveds";
import { SYMBOLS } from "./symbols";

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

export {
  ARITHMETICS,
  LOGICALS,
  RELATIONALS,
  ASSIGNMENTS,
  RESERVEDS,
  SYMBOLS,
  LITERALS,
};
