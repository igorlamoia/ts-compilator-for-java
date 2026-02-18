export type TIssueType = "error" | "warning" | "info";
export type TIssueParams = Record<string, string | number | boolean>;

export class IssueDetails {
  message: string = "";
  line: number;
  column: number;
  type: TIssueType;
  params: TIssueParams | null;

  constructor(
    message: string,
    line: number,
    column: number,
    type: TIssueType,
    params?: TIssueParams
  ) {
    this.message = message;
    this.line = line;
    this.column = column;
    this.type = type;
    this.params = params ?? null;
  }

  getStringIssue(): string {
    return `Issue [${this.type}]: ${this.message} (Line: ${this.line}, Column: ${this.column})`;
  }
}
