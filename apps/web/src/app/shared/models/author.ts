export interface AuthorEntry {
  kind: "registered" | "external";
  memberId?: number;
  name: string;
  photoUrl?: string;
  photoAlt?: string;
  authorOrder: number;
}
