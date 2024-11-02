import { IssueDetails } from "./details";

export class IssueInfo {
  message: string = "";
  details: IssueDetails = new IssueDetails(0, 0, "info");
  constructor(message: string, line: number, column: number) {
    this.message = message;
    this.details = new IssueDetails(line, column, "info");
  }
}
