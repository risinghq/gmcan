import { zValidator } from "@hono/zod-validator";
import type { ValidationTargets } from "hono";
import type { ZodType } from "zod";

import { badRequest } from "./errors/app-error.js";

/** Returns a validator that maps Zod failures to the API's `invalid_request` envelope. */
export function validate<T extends ZodType, Target extends keyof ValidationTargets>(target: Target, schema: T) {
  return zValidator(target, schema, (result) => {
    if ("error" in result) throw badRequest("Invalid request", result.error.issues);
  });
}
