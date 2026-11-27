import type { Capability } from "./capabilities";

export interface Member {
  id: number;
  dni: string;
  email: string;
  firstName: string;
  lastName: string;
  maternalName: string | null;
  birthDate: string | null;
  bio: string | null;
  photoUrl: string | null;
  photoAlt: string;
  isActive: number;
  roleCode: "administrator" | "researcher" | "visitor";
  memberTypeCode: "researcher" | "phd_student" | "master_student" | "undergraduate_student" | "collaborator";
  prefixCode: "dr" | "dra" | "mg" | "lic" | "bach" | "ing" | "none" | null;
  capabilities?: Capability[];
}

export interface MemberFull extends Member {
  genderCode: "male" | "female" | null;
}

export interface MemberPublishability {
  publishable: boolean;
  missing: string[];
}

export interface MemberGroup {
  id: number;
  name: string;
  fullName: string | null;
}
