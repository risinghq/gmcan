import { ASSET_SLOTS } from "@gmcan/contracts/admin";

import { badRequest } from "../../lib/errors/app-error.js";
import type { OwnerType } from "./types.js";

export function assertSlotForOwner(ownerType: OwnerType, slot: string): void {
  const slots: readonly string[] = ASSET_SLOTS[ownerType];
  if (!slots.includes(slot)) {
    throw badRequest(`Unsupported slot '${slot}' for ownerType '${ownerType}'`);
  }
}
