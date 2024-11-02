export type TIssueType = "error" | "warning" | "info";

export class IssueDetails {
  message: string = "";
  line: number;
  column: number;
  type: TIssueType;

  constructor(message: string, line: number, column: number, type: TIssueType) {
    this.message = message;
    this.line = line;
    this.column = column;
    this.type = type;
  }

  getStringIssue(): string {
    return `Issue [${this.type}]: ${this.message} (Line: ${this.line}, Column: ${this.column})`;
  }
}
