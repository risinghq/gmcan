import type { EmailBody } from "./emailBody";
import type { Equipment } from "./equipment";
import { createGroup, type Group } from "./group";
import type { MemberFull } from "./member";
import type { News } from "./news";
import type { Project } from "./project";
import type { ResearchLine } from "./research-line";
import type { Software } from "./software";

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

export function createProject(): Project {
  return {
    id: 0,
    title: "",
    code: "",
    fundedAmountMinor: 0,
    description: "",
    statusCode: "planned",
    startDate: "",
    endDate: null,
    researchLineId: 0,
    currencyCode: "pen",
    fundingSourceCode: "none",
    createdAt: null,
    updatedAt: null,
  };
}

export function createResearchLine(): ResearchLine {
  return {
    id: 0,
    name: "",
    description: "",
    asset: null,
    groupId: 1,
    createdAt: null,
    updatedAt: null,
  };
}

export function createEquipment(): Equipment {
  return {
    id: 0,
    name: "",
    cpu: "",
    gpu: "",
    ram: "",
    storage: "",
    groupId: 1,
    createdAt: null,
    updatedAt: null,
  };
}

export function createSoftware(): Software {
  return {
    id: 0,
    name: "",
    description: "",
    moreInfo: "",
    groupId: 1,
    createdAt: null,
    updatedAt: null,
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
