import { permissionsForRole } from "./permissions.js";
import type { Actor, Permission } from "./types.js";

export interface PolicyContext {
  resourceMemberId?: number;
}

export function isSelf(actor: Actor | null | undefined, resourceMemberId: number | null | undefined): boolean {
  if (!actor || resourceMemberId == null) return false;
  return actor.id === resourceMemberId;
}

export function can(actor: Actor | null | undefined, permission: Permission, context?: PolicyContext): boolean {
  if (!actor) return false;

  if (permission === "account.self.read" || permission === "account.self.write") {
    return isSelf(actor, context?.resourceMemberId ?? actor.id);
  }

  const permissions = permissionsForRole(actor.role);
  return permissions.has(permission);
}
