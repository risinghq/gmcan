import { randomUUID } from "node:crypto";

import type { AppErrorCode, ErrorHttpStatus } from "@gmcan/contracts/error";
import type { Context } from "hono";
import { HTTPException } from "hono/http-exception";

import { AppError, statusToErrorCode } from "../lib/errors/app-error.js";

function jsonError(c: Context, status: ErrorHttpStatus, code: AppErrorCode, message: string, details?: unknown) {
  const traceId = randomUUID();
  return c.json(
    {
      ok: false,
      error: {
        code,
        status,
        message,
        details,
        traceId,
      },
    },
    status,
  );
}

function toErrorStatus(status: number): ErrorHttpStatus {
  if (status === 400 || status === 401 || status === 403 || status === 404 || status === 409) return status;
  if (status === 422) return 422;
  if (status === 502) return 502;
  if (status === 503) return 503;
  return 500;
}

export function onError(err: unknown, c: Context) {
  if (err instanceof AppError) {
    return jsonError(c, err.status, err.code, err.message, err.details);
  }

  if (err instanceof HTTPException) {
    const status = toErrorStatus(err.status);
    const code = statusToErrorCode(status);
    return jsonError(c, status, code, err.message);
  }

  console.error("Unhandled error in API route", err);
  return jsonError(c, 500, "internal_error", "Internal server error");
}
