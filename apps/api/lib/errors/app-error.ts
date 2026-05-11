import type { AppErrorCode } from "@gmcan/contracts/error";

export class AppError extends Error {
  constructor(
    public readonly code: AppErrorCode,
    message: string,
    public readonly status: number,
    public readonly details?: unknown,
  ) {
    super(message);
    this.name = "AppError";
  }
}

export function statusToErrorCode(status: number): AppErrorCode {
  if (status === 400) return "invalid_request";
  if (status === 401) return "unauthorized";
  if (status === 403) return "forbidden";
  if (status === 404) return "not_found";
  if (status === 409) return "conflict";
  if (status >= 400 && status < 500) return "invalid_request";
  return "internal_error";
}
