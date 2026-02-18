import { IssueDetails, TIssueParams } from "./details";

export class IssueInfo extends IssueDetails {
  constructor(
    message: string,
    line: number,
    column: number,
    params?: TIssueParams
  ) {
    super(message, line, column, "info", params);
  }
}
