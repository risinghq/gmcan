// zod/mini tree-shakes; the web parses this envelope on every page, and classic zod would add ~480 kB to its first load.
import * as z from "zod/mini";

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
    details: z.optional(z.unknown()),
    traceId: z.optional(z.string()),
  }),
});

export type AppErrorCode = z.infer<typeof AppErrorCodeSchema>;
export type ErrorHttpStatus = z.infer<typeof ErrorHttpStatusSchema>;
export type ErrorEnvelope = z.infer<typeof ErrorEnvelopeSchema>;
