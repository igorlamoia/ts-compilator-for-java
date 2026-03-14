import { IssueDetails, TIssueParams } from "./details";

export class IssueError extends Error {
  details: IssueDetails;

  constructor(
    code: string,
    message: string,
    line: number,
    column: number,
    params?: TIssueParams,
  ) {
    super(message);
    this.details = new IssueDetails(
      code,
      message,
      line,
      column,
      "error",
      params,
    );

    // Object.setPrototypeOf(this, IssueError.prototype);
  }

  getFormattedError(): string {
    return `Issue [${this.details.type}]: ${this.message} (Line: ${this.details.line}, Column: ${this.details.column})`;
  }
}
