import type { AppErrorCode, ErrorHttpStatus } from "@gmcan/contracts/error";

export class AppError extends Error {
  constructor(
    public readonly code: AppErrorCode,
    message: string,
    public readonly status: ErrorHttpStatus,
    public readonly details?: unknown,
  ) {
    super(message);
    this.name = "AppError";
  }
}

/** Routes and middleware throw these errors. `onError` turns them into the API envelope. */
export const badRequest = (message: string, details?: unknown) =>
  new AppError("invalid_request", message, 400, details);
export const unauthorized = (message = "Unauthorized") => new AppError("unauthorized", message, 401);
export const forbidden = (message = "Forbidden") => new AppError("forbidden", message, 403);
export const notFound = (message = "Not found") => new AppError("not_found", message, 404);

const STATUS_TO_CODE_MAP: Record<ErrorHttpStatus, AppErrorCode> = {
  400: "invalid_request",
  401: "unauthorized",
  403: "forbidden",
  404: "not_found",
  409: "conflict",
  422: "invariant_violation",
  500: "internal_error",
  502: "upstream_failure",
  503: "upstream_failure",
};

export function statusToErrorCode(status: ErrorHttpStatus): AppErrorCode {
  return STATUS_TO_CODE_MAP[status];
}
