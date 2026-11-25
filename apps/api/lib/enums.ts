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

export const Currency = {
  PEN: "pen",
  USD: "usd",
} as const;

export const FundingSource = {
  VRIP: "vrip",
  NONE: "none",
} as const;
