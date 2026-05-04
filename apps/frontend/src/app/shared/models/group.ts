export interface Group {
  id: number;
  summary: string;
  address: string | null;
  email: string | null;
  phone: string | null;
  name: string | null;
  fullName: string | null;
  facilitiesPhoto: string | null;
  facilities: string | null;
  futureWork: string | null;
  logoFooter: string | null;
  logoHeader: string | null;
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
    facilitiesPhoto: null,
    facilities: null,
    futureWork: null,
    logoFooter: null,
    logoHeader: null,
    publicationsSection: null,
    projectsSection: null,
    createdAt: "",
    updatedAt: "",
  };
}
