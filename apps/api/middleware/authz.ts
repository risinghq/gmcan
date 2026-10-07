import type { Context, MiddlewareHandler, Next } from "hono";

import { permissionsForRole, roleByCode } from "../authz/permissions.js";
import { can } from "../authz/policy.js";
import type { Actor, Permission } from "../authz/types.js";
import { forbidden, unauthorized } from "../lib/errors/app-error.js";
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
  if (!memberId) throw unauthorized();

  const locale = c.get("locale");
  const member = await getMemberFull(memberId, locale);
  if (!member) throw unauthorized();

  const role = roleByCode[member.roleCode];
  if (!role) throw forbidden();

  c.set("actor", {
    id: member.id,
    roleCode: member.roleCode,
    role,
    isActive: member.isActive,
  });

  await next();
};

export function requirePermission(permission: Permission): MiddlewareHandler {
  return async (c, next) => {
    const actor = c.get("actor");
    if (!can(actor, permission)) {
      logDenial(c, permission, "missing_permission");
      throw forbidden();
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
    throw forbidden();
  };
}

export function capabilitiesForActor(actor: Actor): Permission[] {
  return [...new Set<Permission>([...permissionsForRole(actor.role), "account.self.read", "account.self.write"])];
}
