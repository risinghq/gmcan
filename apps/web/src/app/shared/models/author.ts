export interface AuthorSearchResult {
  id: number;
  name: string;
  photoUrl: string;
  photoAlt: string;
}

export interface AuthorEntry {
  kind: "registered" | "external";
  memberId?: number;
  name: string;
  photoUrl?: string;
  photoAlt?: string;
  authorOrder: number;
}

export type SaveAuthorEntry =
  | { kind: "registered"; memberId: number; authorOrder: number }
  | { kind: "external"; externalName: string; authorOrder: number };
