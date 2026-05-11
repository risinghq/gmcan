import { randomUUID } from "node:crypto";

import type { AppErrorCode } from "@gmcan/contracts/error";
import type { Context } from "hono";
import { HTTPException } from "hono/http-exception";

import { AppError, statusToErrorCode } from "../lib/errors/app-error.js";

function jsonError(c: Context, status: number, code: AppErrorCode, message: string, details?: unknown) {
  const traceId = randomUUID();
  return c.json(
    {
      ok: false,
      error: {
        code,
        message,
        details,
        traceId,
      },
    },
    { status },
  );
}

export function onError(err: unknown, c: Context) {
  if (err instanceof AppError) {
    return jsonError(c, err.status, err.code, err.message, err.details);
  }

  if (err instanceof HTTPException) {
    const status = err.status;
    const code = statusToErrorCode(status);
    return jsonError(c, status, code, err.message);
  }

  console.error(err);
  return jsonError(c, 500, "internal_error", "Internal server error");
}
