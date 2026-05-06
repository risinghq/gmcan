export const Gender = {
  MALE: "male",
  FEMALE: "female",
} as const;

export const Prefix = {
  DR: "dr",
  DRA: "dra",
  MG: "mg",
  LIC: "lic",
  BACH: "bach",
  ING: "ing",
  NONE: "none",
} as const;

export const Role = {
  ADMINISTRATOR: "administrator",
  RESEARCHER: "researcher",
  VISITOR: "visitor",
} as const;

export const MemberType = {
  RESEARCHER: "researcher",
  PHD_STUDENT: "phd_student",
  MASTER_STUDENT: "master_student",
  UNDERGRADUATE_STUDENT: "undergraduate_student",
  COLLABORATOR: "collaborator",
} as const;

export const PublicationKind = {
  JOURNAL_ARTICLE: "journal_article",
  CONFERENCE_PAPER: "conference_paper",
  THESIS: "thesis",
} as const;

export const ThesisKind = {
  PHD: "phd",
  MASTERS: "masters",
} as const;

export const NewsKind = {
  GENERAL: "general",
  RESEARCH: "research",
  EVENT: "event",
} as const;

export const NewsStatus = {
  DRAFT: "draft",
  PUBLISHED: "published",
  ARCHIVED: "archived",
} as const;

export const ProjectStatus = {
  PLANNED: "planned",
  ACTIVE: "active",
  COMPLETED: "completed",
  ARCHIVED: "archived",
} as const;

export const Currency = {
  PEN: "pen",
  USD: "usd",
} as const;

export const FundingSource = {
  VRIP: "vrip",
  NONE: "none",
} as const;

export const ResearchLine = {
  NANOPARTICLES: 1,
  HEXAGONAL: 2,
  NANOMAGNETISM: 3,
} as const;

export const Event = {
  SIMPOSIO_FISICA: 1,
} as const;

export const Journal = {
  APPLIED_SURFACE_SCIENCE: 1,
  RIF: 2,
  PCCP: 3,
  PHYSICA_B: 4,
  JPA: 5,
  PHYSICS_LETTERS_A: 6,
  MOMENTO: 7,
  RMF: 8,
} as const;

export const University = {
  UNMSM: 1,
  UDEP: 2,
} as const;
