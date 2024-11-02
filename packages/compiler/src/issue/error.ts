import { IssueDetails } from "./details";

export class IssueError extends Error {
  details: IssueDetails;

  constructor(message: string, line: number, column: number) {
    super(message);
    this.details = new IssueDetails(line, column, "error");

    // Object.setPrototypeOf(this, IssueError.prototype);
  }

  getFormattedError(): string {
    return `Issue [${this.details.type}]: ${this.message} (Line: ${this.details.line}, Column: ${this.details.column})`;
  }
}
