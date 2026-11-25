import type { EmailBody } from "./emailBody";
import { createGroup, type Group } from "./group";
import type { MemberFull } from "./member";

export { createGroup };
export type { Group };

export function createMemberFull(): MemberFull {
  return {
    id: 0,
    dni: "",
    email: "",
    firstName: "",
    lastName: "",
    maternalName: null,
    birthDate: null,
    bio: null,
    photoUrl: "",
    photoAlt: "",
    isActive: 1,
    roleCode: "researcher",
    memberTypeCode: "researcher",
    prefixCode: null,
    genderCode: null,
  };
}

export function createEmailBody(): EmailBody {
  return {
    nombre: "",
    razon: "",
    correo: "",
    telefono: "",
  };
}
