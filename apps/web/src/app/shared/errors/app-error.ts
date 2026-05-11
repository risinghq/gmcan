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
