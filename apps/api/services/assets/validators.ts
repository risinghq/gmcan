import { z } from "zod";

import { OWNER_CONFIG } from "./policy.js";
import type { OwnerType } from "./types.js";

export const OwnerTypeSchema = z.enum([
  "member",
  "news",
  "method",
  "research_line",
  "publication",
  "research_group",
  "about",
]);

export const CanonicalAssetPayloadSchema = z.object({
  ownerType: OwnerTypeSchema,
  ownerId: z.coerce.number().int().positive(),
  slot: z.string().min(1),
});

export function assertSlotForOwner(ownerType: OwnerType, slot: string): void {
  const config = OWNER_CONFIG[ownerType];
  if (!config.slots.includes(slot as never)) {
    throw new Error(`Unsupported slot '${slot}' for ownerType '${ownerType}'`);
  }
}
