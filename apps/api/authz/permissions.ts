import type { Permission, Role } from "./types.js";

export const roleByCode: Record<Role, Role> = {
  administrator: "administrator",
  researcher: "researcher",
  visitor: "visitor",
};

const permissionsByRole: Record<Role, ReadonlySet<Permission>> = {
  administrator: new Set<Permission>([
    "news.read",
    "news.write",
    "members.read",
    "members.write",
    "projects.read",
    "projects.write",
    "publications.read",
    "publications.write",
    "content.read",
    "content.write",
    "refs.read",
    "refs.write",
    "analytics.read",
    "account.self.read",
    "account.self.write",
  ]),
  researcher: new Set<Permission>([
    "news.read",
    "news.write",
    "projects.read",
    "projects.write",
    "publications.read",
    "publications.write",
    "account.self.read",
    "account.self.write",
  ]),
  visitor: new Set<Permission>(["account.self.read", "account.self.write"]),
};

export function permissionsForRole(role: Role): ReadonlySet<Permission> {
  return permissionsByRole[role] ?? new Set<Permission>();
}
