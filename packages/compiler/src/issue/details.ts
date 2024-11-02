export type TIssueType = "error" | "warning" | "info";

export class IssueDetails {
  line: number;
  column: number;
  type: TIssueType;

  constructor(line: number, column: number, type: TIssueType) {
    this.line = line;
    this.column = column;
    this.type = type;
  }
}
