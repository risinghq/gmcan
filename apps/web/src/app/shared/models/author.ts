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
  authorOrder: number;
}

export type SaveAuthorEntry =
  | { kind: "registered"; memberId: number; authorOrder: number }
  | { kind: "external"; externalName: string; authorOrder: number };
