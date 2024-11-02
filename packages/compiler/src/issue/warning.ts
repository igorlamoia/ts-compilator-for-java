import { IssueDetails } from "./details";

export class IssueWarning {
  message: string = "";
  details: IssueDetails = new IssueDetails(0, 0, "warning");
  constructor(message: string, line: number, column: number) {
    this.message = message;
    this.details = new IssueDetails(line, column, "warning");
  }
}
