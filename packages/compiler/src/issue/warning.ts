import { IssueDetails, TIssueParams } from "./details";

export class IssueWarning extends IssueDetails {
  constructor(
    message: string,
    line: number,
    column: number,
    params?: TIssueParams
  ) {
    super(message, line, column, "warning", params);
  }
}
