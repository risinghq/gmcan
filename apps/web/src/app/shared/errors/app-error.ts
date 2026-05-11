import { HttpErrorResponse } from "@angular/common/http";
import { ErrorEnvelopeSchema } from "@gmcan/contracts/error";
import type { AppErrorCode } from "@gmcan/contracts/error";

export type NavigationAppError = {
  code: AppErrorCode;
  message: string;
  details?: unknown;
  cause?: unknown;
};

export class RouteDataError extends Error {
  constructor(public readonly appError: NavigationAppError) {
    super(appError.message);
    this.name = "RouteDataError";
  }
}

export function toNavigationAppError(error: unknown): NavigationAppError {
  if (error instanceof RouteDataError) {
    return error.appError;
  }

  if (error instanceof HttpErrorResponse) {
    const parsed = ErrorEnvelopeSchema.safeParse(error.error);
    if (parsed.success) {
      return {
        code: parsed.data.error.code,
        message: parsed.data.error.message,
        details: parsed.data.error.details,
        cause: error,
      };
    }
  }

  if (error instanceof Error) {
    return {
      code: "internal_error",
      message: error.message,
      cause: error,
    };
  }

  return {
    code: "internal_error",
    message: "Unknown navigation error",
    cause: error,
  };
}
