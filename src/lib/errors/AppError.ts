/**
 * Central error taxonomy. Every server action / route handler returns
 * either { ok: true, data } or { ok: false, error: AppErrorPayload }.
 * Raw stack traces never reach the user.
 */

export type ErrorCode =
  | "VALIDATION"
  | "UNAUTHORIZED"
  | "FORBIDDEN"
  | "NOT_FOUND"
  | "CONFLICT"
  | "UPSTREAM"
  | "INTERNAL";

export interface AppErrorPayload {
  code: ErrorCode;
  message: string;
  fieldErrors?: Record<string, string>;
}

export class AppError extends Error {
  code: ErrorCode;
  httpStatus: number;
  fieldErrors?: Record<string, string>;

  constructor(
    code: ErrorCode,
    message: string,
    options: { fieldErrors?: Record<string, string>; httpStatus?: number } = {},
  ) {
    super(message);
    this.code = code;
    this.fieldErrors = options.fieldErrors;
    this.httpStatus = options.httpStatus ?? STATUS_BY_CODE[code];
  }

  toPayload(): AppErrorPayload {
    return { code: this.code, message: this.message, fieldErrors: this.fieldErrors };
  }
}

const STATUS_BY_CODE: Record<ErrorCode, number> = {
  VALIDATION: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  UPSTREAM: 502,
  INTERNAL: 500,
};

// Factories for common cases
export const Errors = {
  validation: (message = "Please check the form and try again.", fieldErrors?: Record<string, string>) =>
    new AppError("VALIDATION", message, { fieldErrors }),
  unauthorized: (message = "Your session has expired. Please sign in again.") =>
    new AppError("UNAUTHORIZED", message),
  forbidden: (message = "You do not have permission to perform this action.") =>
    new AppError("FORBIDDEN", message),
  notFound: (message = "The requested record could not be found.") =>
    new AppError("NOT_FOUND", message),
  conflict: (message = "This record conflicts with existing data.") =>
    new AppError("CONFLICT", message),
  upstream: (message = "A required service is temporarily unavailable.") =>
    new AppError("UPSTREAM", message),
  internal: (message = "We could not complete this action. Please try again.") =>
    new AppError("INTERNAL", message),
};