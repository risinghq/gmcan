import { randomUUID } from "node:crypto";

import {
  type AppErrorCode,
  type ErrorEnvelope,
  type ErrorHttpStatus,
  ErrorHttpStatusSchema,
} from "@gmcan/contracts/error";
import type { Context } from "hono";
import { HTTPException } from "hono/http-exception";

import { AppError, statusToErrorCode } from "../lib/errors/app-error.js";

/** Build the API error envelope. Callers should throw `AppError` instead. */
function jsonError(c: Context, status: ErrorHttpStatus, code: AppErrorCode, message: string, details?: unknown) {
  const body: ErrorEnvelope = { ok: false, error: { code, status, message, details, traceId: randomUUID() } };
  return c.json(body, status);
}

/** Return the status only when the error contract declares it. */
function declaredStatus(status: number): ErrorHttpStatus | undefined {
  const parsed = ErrorHttpStatusSchema.safeParse(status);
  return parsed.success ? parsed.data : undefined;
}

/**
 * D1 and bun:sqlite both surface SQLite's own message text, so a restricted delete or a duplicate
 * key is recognisable without a driver-specific error class.
 */
function isConstraintViolation(err: unknown): boolean {
  return err instanceof Error && /(FOREIGN KEY|UNIQUE) constraint failed/.test(err.message);
}

export function onError(err: unknown, c: Context) {
  if (err instanceof AppError) {
    return jsonError(c, err.status, err.code, err.message, err.details);
  }

  if (err instanceof HTTPException) {
    const status = declaredStatus(err.status);
    if (status) return jsonError(c, status, statusToErrorCode(status), err.message);
    // An undeclared status cannot be represented accurately in the error contract.
    // Add the status to the contract before throwing it.
    console.error(`HTTPException with undeclared status ${err.status}`, err);
    return jsonError(c, 500, "internal_error", "Internal server error");
  }

  if (isConstraintViolation(err)) {
    return jsonError(c, 409, "conflict", "The change conflicts with related records");
  }

  console.error("Unhandled error in API route", err);
  return jsonError(c, 500, "internal_error", "Internal server error");
}

export function onNotFound(c: Context) {
  return jsonError(c, 404, "not_found", "Not found");
}
