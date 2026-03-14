import { IssueDetails, TIssueParams } from "./details";

export class IssueWarning extends IssueDetails {
  constructor(
    code: string,
    message: string,
    line: number,
    column: number,
    params?: TIssueParams,
  ) {
    super(code, message, line, column, "warning", params);
  }
}
