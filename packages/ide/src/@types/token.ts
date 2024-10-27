export type TToken = {
  column: number;
  lexeme: string;
  line: number;
  type: number;
};

export type TTokenStyle = {
  text: string;
  bg: string;
  border: string;
  transform: string;
};

export type TTokenStyleKey =
  | "LITERALS_STYLE"
  | "ARITHMETICS_STYLE"
  | "ASSIGNMENTS_STYLE"
  | "LOGICALS_STYLE"
  | "RELATIONALS_STYLE"
  | "RESERVEDS_STYLE"
  | "SYMBOLS_STYLE";

export type TTokenClass =
  | "LITERALS"
  | "ARITHMETICS"
  | "ASSIGNMENTS"
  | "LOGICALS"
  | "RELATIONALS"
  | "RESERVEDS"
  | "SYMBOLS";

export type TTokenClassification = {
  [key in TTokenClass]: number[];
};

export type TFormattedToken = {
  token: TToken;
  info: { styles: TTokenStyle; type: string | undefined };
};
