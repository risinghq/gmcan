import { z } from "zod";

export const AppErrorCodeSchema = z.enum([
  "invalid_request",
  "unauthorized",
  "forbidden",
  "not_found",
  "conflict",
  "upstream_failure",
  "invariant_violation",
  "internal_error",
]);

export const ErrorHttpStatusSchema = z.union([
  z.literal(400),
  z.literal(401),
  z.literal(403),
  z.literal(404),
  z.literal(409),
  z.literal(422),
  z.literal(500),
  z.literal(502),
  z.literal(503),
]);

export const ErrorEnvelopeSchema = z.object({
  ok: z.literal(false),
  error: z.object({
    code: AppErrorCodeSchema,
    status: ErrorHttpStatusSchema,
    message: z.string(),
    details: z.unknown().optional(),
    traceId: z.string().optional(),
  }),
});

export type AppErrorCode = z.infer<typeof AppErrorCodeSchema>;
export type ErrorHttpStatus = z.infer<typeof ErrorHttpStatusSchema>;
export type ErrorEnvelope = z.infer<typeof ErrorEnvelopeSchema>;
