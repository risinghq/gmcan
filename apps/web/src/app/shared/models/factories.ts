import type { EmailBody } from "./emailBody";
import { createGroup, type Group } from "./group";
import type { MemberFull } from "./member";
import type { News } from "./news";

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

export function createNews(): News {
  return {
    id: 0,
    title: "",
    summary: "",
    body: "",
    statusCode: "draft",
    publishedAt: "",
    asset: null,
    priority: 0,
    authorId: 0,
    newsKindCode: "general",
    updatedAt: null,
    createdAt: null,
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
