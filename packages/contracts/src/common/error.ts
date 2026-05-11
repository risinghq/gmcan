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

export const ErrorEnvelopeSchema = z.object({
  ok: z.literal(false),
  error: z.object({
    code: AppErrorCodeSchema,
    message: z.string(),
    details: z.unknown().optional(),
    traceId: z.string().optional(),
  }),
});

export type AppErrorCode = z.infer<typeof AppErrorCodeSchema>;
export type ErrorEnvelope = z.infer<typeof ErrorEnvelopeSchema>;
