/**
 * A person who can be credited on a publication.
 * Registered users have an account (DNI + foto); external authors are name-only.
 */
export type AuthorOption = {
  kind: "registered" | "external";
  nombre: string;
  DNI?: string; // present when kind === "registered"
  foto?: string | null; // present when kind === "registered" and user has a photo
};

export type PublicationAuthor = AuthorOption & { isPrincipal: number };

export type SaveAuthorEntry =
  | { kind: "registered"; DNI: string; isPrincipal: number }
  | { kind: "external"; nombre: string; isPrincipal: number };
