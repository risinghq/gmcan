import { z } from "zod";

/** An upload names one owner and one of its slots. */
export const ASSET_SLOTS = {
  member: ["photo"],
  news: ["photo"],
  method: ["photo"],
  research_line: ["photo"],
  publication: ["file"],
  research_group: ["facilities", "header", "footer"],
  about: ["photo"],
} as const;

export type AssetOwnerType = keyof typeof ASSET_SLOTS;
export type AssetSlot<T extends AssetOwnerType = AssetOwnerType> = (typeof ASSET_SLOTS)[T][number];

function ownerTarget<T extends AssetOwnerType>(ownerType: T) {
  return z.object({
    ownerType: z.literal(ownerType),
    ownerId: z.coerce.number().int().positive(),
    slot: z.enum(ASSET_SLOTS[ownerType]),
  });
}

/** An upload sends these as multipart fields. A delete sends them as JSON. */
export const AssetTargetSchema = z.discriminatedUnion("ownerType", [
  ownerTarget("member"),
  ownerTarget("news"),
  ownerTarget("method"),
  ownerTarget("research_line"),
  ownerTarget("publication"),
  ownerTarget("research_group"),
  ownerTarget("about"),
]);

export type AssetTarget = z.infer<typeof AssetTargetSchema>;
