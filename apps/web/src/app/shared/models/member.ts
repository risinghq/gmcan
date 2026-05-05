import type { Capability } from "./capabilities";
import type { Project } from "./project";
import type { Publication } from "./publication";

export interface Member {
  id: number;
  dni: string;
  email: string;
  firstName: string;
  lastName: string;
  maternalName: string | null;
  birthDate: string | null;
  bio: string | null;
  asset: string | null;
  status: number;
  roleId: number;
  memberTypeId: number;
  prefixId: number | null;
  capabilities?: Capability[];
}

export interface MemberFull extends Member {
  genderId: number | null;
}

export interface MemberProfile {
  member: Member | undefined;
  projects: Project[];
  publications: Publication[];
}
