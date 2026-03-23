export type TTestCaseResult = {
  label: string;
  input: string;
  expectedOutput: string;
  actualOutput: string;
  passed: boolean;
};

export type TValidationResult = {
  valid: boolean;
  errors: string[];
  warnings: string[];
  submissionId?: string;
  testCaseResults?: TTestCaseResult[];
  testCasesPassed?: number;
  testCasesTotal?: number;
};
