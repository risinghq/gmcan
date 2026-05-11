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

const STATUS_TO_CODE_MAP: Record<ErrorHttpStatus, AppErrorCode> = {
  400: "invalid_request",
  401: "unauthorized",
  403: "forbidden",
  404: "not_found",
  409: "conflict",
  422: "invalid_request",
  500: "internal_error",
  502: "upstream_failure",
  503: "upstream_failure",
};

const CODE_TO_STATUS_MAP: Record<AppErrorCode, ErrorHttpStatus> = {
  invalid_request: 400,
  unauthorized: 401,
  forbidden: 403,
  not_found: 404,
  conflict: 409,
  upstream_failure: 502,
  invariant_violation: 422,
  internal_error: 500,
};

export function statusToErrorCode(status: ErrorHttpStatus): AppErrorCode {
  return STATUS_TO_CODE_MAP[status];
}

export function codeToErrorStatus(code: AppErrorCode): ErrorHttpStatus {
  return CODE_TO_STATUS_MAP[code];
}
