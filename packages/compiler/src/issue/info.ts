import { IssueDetails, TIssueParams } from "./details";

export class IssueInfo extends IssueDetails {
  constructor(
    code: string,
    message: string,
    line: number,
    column: number,
    params?: TIssueParams,
  ) {
    super(code, message, line, column, "info", params);
  }
}
