import type { Context, MiddlewareHandler, Next } from "hono";

import { permissionsForRole, roleById } from "../authz/permissions.js";
import { can } from "../authz/policy.js";
import type { Actor, Permission } from "../authz/types.js";
import { getMemberFull } from "../services/member.service.js";
import { AUTH_EXEMPT_PATHS } from "./auth-exempt.js";

declare module "hono" {
  interface ContextVariableMap {
    actor: Actor;
  }
}

function logDenial(c: Context, permission: Permission, reason: string): void {
  const actor = c.get("actor");
  console.warn(
    JSON.stringify({
      type: "authz_denied",
      actorId: actor?.id ?? null,
      role: actor?.role ?? null,
      path: c.req.path,
      method: c.req.method,
      permission,
      reason,
    }),
  );
}

export const loadActor: MiddlewareHandler = async (c: Context, next: Next) => {
  if (AUTH_EXEMPT_PATHS.has(c.req.path)) return next();

  const memberId = c.get("memberId");
  if (!memberId) return c.json({ error: "Unauthorized" }, 401);

  const member = await getMemberFull(memberId);
  if (!member) return c.json({ error: "Unauthorized" }, 401);

  const role = roleById[member.roleId];
  if (!role) return c.json({ error: "Forbidden" }, 403);

  c.set("actor", {
    id: member.id,
    roleId: member.roleId,
    role,
    status: member.status,
  });

  await next();
};

export function requirePermission(permission: Permission): MiddlewareHandler {
  return async (c, next) => {
    const actor = c.get("actor");
    if (!can(actor, permission)) {
      logDenial(c, permission, "missing_permission");
      return c.json({ error: "Forbidden" }, 403);
    }
    await next();
  };
}

interface SelfOrPermissionGuardOptions {
  resourceParam: string;
  selfPermission: Permission;
  elevatedPermission: Permission;
}

export function requireSelfOrPermission(options: SelfOrPermissionGuardOptions): MiddlewareHandler {
  const { resourceParam, selfPermission, elevatedPermission } = options;

  return async (c, next) => {
    const actor = c.get("actor");
    const resourceRaw = c.req.param(resourceParam);
    const resourceMemberId = Number(resourceRaw);

    if (can(actor, elevatedPermission)) {
      await next();
      return;
    }

    if (Number.isFinite(resourceMemberId) && can(actor, selfPermission, { resourceMemberId })) {
      await next();
      return;
    }

    logDenial(c, elevatedPermission, "missing_permission_or_not_self");
    return c.json({ error: "Forbidden" }, 403);
  };
}

export function capabilitiesForActor(actor: Actor): Permission[] {
  return [...new Set<Permission>([...permissionsForRole(actor.role), "account.self.read", "account.self.write"])];
}
