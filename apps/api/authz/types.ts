export type Role = "administrator" | "researcher" | "visitor";

export type Permission =
  | "news.read"
  | "news.write"
  | "members.read"
  | "members.write"
  | "projects.read"
  | "projects.write"
  | "publications.read"
  | "publications.write"
  | "content.read"
  | "content.write"
  | "refs.read"
  | "refs.write"
  | "analytics.read"
  | "account.self.read"
  | "account.self.write";

export interface Actor {
  id: number;
  roleCode: Role;
  role: Role;
  isActive: number;
}
