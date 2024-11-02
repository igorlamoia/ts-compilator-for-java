import { IssueDetails } from "./details";

export class IssueInfo extends IssueDetails {
  constructor(message: string, line: number, column: number) {
    super(message, line, column, "info");
  }
}
