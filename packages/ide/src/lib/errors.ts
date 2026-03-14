export type THttpIssueType = 'error'
export type THttpIssueParams = Record<string, string | number | boolean>

export class HttpIssueDetails {
  code: string = ''
  message: string = ''
  statusCode: number
  type: THttpIssueType
  params: THttpIssueParams | null

  constructor(
    code: string,
    message: string,
    statusCode: number,
    type: THttpIssueType,
    params?: THttpIssueParams,
  ) {
    this.code = code
    this.message = message
    this.statusCode = statusCode
    this.type = type
    this.params = params ?? null
  }

  getStringIssue(): string {
    return `Erro: ${this.message} (HTTP: ${this.statusCode})`
  }
}

export class HttpError extends Error {
  details: HttpIssueDetails

  constructor(
    code: string,
    message: string,
    statusCode: number,
    params?: THttpIssueParams,
  ) {
    super(message)
    this.name = new.target.name
    this.details = new HttpIssueDetails(code, message, statusCode, 'error', params)
  }

  get statusCode(): number {
    return this.details.statusCode
  }

  getFormattedError(): string {
    return this.details.getStringIssue()
  }

  getHttpResponse(): { statusCode: number; error: string; code: string } {
    return {
      statusCode: this.details.statusCode,
      error: this.message,
      code: this.details.code,
    }
  }
}

export class ValidationError extends HttpError {
  constructor(message: string, params?: THttpIssueParams) {
    super('VALIDATION_ERROR', message, 400, params)
  }
}

export class NotFoundError extends HttpError {
  constructor(message: string, params?: THttpIssueParams) {
    super('NOT_FOUND_ERROR', message, 404, params)
  }
}

export class UnauthorizedError extends HttpError {
  constructor(message: string, params?: THttpIssueParams) {
    super('UNAUTHORIZED_ERROR', message, 401, params)
  }
}

export class ConflictError extends HttpError {
  constructor(message: string, params?: THttpIssueParams) {
    super('CONFLICT_ERROR', message, 409, params)
  }
}

export class ForbiddenError extends HttpError {
  constructor(message: string, params?: THttpIssueParams) {
    super('FORBIDDEN_ERROR', message, 403, params)
  }
}
