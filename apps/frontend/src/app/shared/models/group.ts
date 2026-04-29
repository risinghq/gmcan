export interface Group {
  id: number;
  summaryES: string;
  summaryEN: string;
  address: string | null;
  email: string | null;
  phone: string | null;
  name: string | null;
  fullName: string | null;
  facilitiesPhoto: string | null;
  facilitiesES: string | null;
  facilitiesEN: string | null;
  futureWorkES: string | null;
  futureWorkEN: string | null;
  logoFooter: string | null;
  logoHeader: string | null;
  publicationsSectionES: string | null;
  publicationsSectionEN: string | null;
  projectsSectionES: string | null;
  projectsSectionEN: string | null;
  createdAt: string;
  updatedAt: string;
}

export function createGroup(): Group {
  return {
    id: 0,
    summaryES: "",
    summaryEN: "",
    address: null,
    email: null,
    phone: null,
    name: null,
    fullName: null,
    facilitiesPhoto: null,
    facilitiesES: null,
    facilitiesEN: null,
    futureWorkES: null,
    futureWorkEN: null,
    logoFooter: null,
    logoHeader: null,
    publicationsSectionES: null,
    publicationsSectionEN: null,
    projectsSectionES: null,
    projectsSectionEN: null,
    createdAt: "",
    updatedAt: "",
  };
}
