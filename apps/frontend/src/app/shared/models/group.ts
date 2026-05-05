export interface Group {
  id: number;
  summary: string;
  address: string | null;
  email: string | null;
  phone: string | null;
  name: string | null;
  fullName: string | null;
  assets: { facilities: string | null; header: string | null; footer: string | null };
  facilities: string | null;
  futureWork: string | null;
  publicationsSection: string | null;
  projectsSection: string | null;
  createdAt: string;
  updatedAt: string;
}

export function createGroup(): Group {
  return {
    id: 0,
    summary: "",
    address: null,
    email: null,
    phone: null,
    name: null,
    fullName: null,
    assets: { facilities: null, header: null, footer: null },
    facilities: null,
    futureWork: null,
    publicationsSection: null,
    projectsSection: null,
    createdAt: "",
    updatedAt: "",
  };
}
