export interface AuthorSearchResult {
  id: number;
  name: string;
  asset: string | null;
}

export interface AuthorEntry {
  kind: "registered" | "external";
  memberId?: number;
  name: string;
  asset?: string | null;
  isPrincipal: number;
}

export type SaveAuthorEntry =
  | { kind: "registered"; memberId: number; isPrincipal: number }
  | { kind: "external"; externalName: string; isPrincipal: number };
