import { IssueDetails } from "./details";

export class IssueWarning extends IssueDetails {
  constructor(message: string, line: number, column: number) {
    super(message, line, column, "warning");
  }
}
