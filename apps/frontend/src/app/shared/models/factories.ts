import type { EmailBody } from "./emailBody";
import type { Equipment } from "./equipment";
import { createGroup, type Group } from "./group";
import type { MemberFull } from "./member";
import type { News } from "./news";
import type { Project } from "./project";
import type { Publication } from "./publication";
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
    photo: null,
    status: 1,
    roleId: 2,
    memberTypeId: 0,
    prefixId: null,
    genderId: null,
  };
}

export function createNews(): News {
  return {
    id: 0,
    title: "",
    summary: "",
    body: "",
    status: 0,
    publishedAt: "",
    photo: null,
    priority: 0,
    authorId: 0,
    newsTypeId: 0,
    updatedAt: null,
    createdAt: null,
  };
}

export function createPublication(): Publication {
  return {
    id: 0,
    title: "",
    file: null,
    abstract: "",
    journalIssue: null,
    doi: "",
    publishedAt: "",
    typeId: 0,
    journalId: null,
    universityId: null,
    eventId: null,
    thesisTypeId: null,
    updatedAt: null,
    createdAt: null,
  };
}

export function createProject(): Project {
  return {
    id: 0,
    title: "",
    code: "",
    fundedAmount: "",
    description: "",
    status: 1,
    startDate: "",
    endDate: null,
    researchLineId: 0,
    currencyId: 0,
    fundingSourceId: 0,
    createdAt: null,
    updatedAt: null,
  };
}

export function createResearchLine(): ResearchLine {
  return {
    id: 0,
    name: "",
    description: "",
    photo: null,
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
