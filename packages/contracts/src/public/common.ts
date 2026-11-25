import { z } from "zod";

export const AssetLinksSchema = z.object({
  inline: z.string(),
  download: z.string(),
});

export const NewsKindCodeSchema = z.enum(["general", "research", "event"]);
export const NewsStatusCodeSchema = z.enum(["draft", "published", "archived"]);
export const PublicationKindCodeSchema = z.enum(["journal_article", "conference_paper", "thesis"]);
export const ThesisKindCodeSchema = z.enum(["phd", "masters"]);
export const ProjectStatusCodeSchema = z.enum(["planned", "active", "completed", "archived"]);
export const CurrencyCodeSchema = z.enum(["pen", "usd"]);
export const FundingSourceCodeSchema = z.enum(["vrip", "none"]);
export const RoleCodeSchema = z.enum(["administrator", "researcher", "visitor"]);
export const MemberTypeCodeSchema = z.enum([
  "researcher",
  "phd_student",
  "master_student",
  "undergraduate_student",
  "collaborator",
]);
export const PrefixCodeSchema = z.enum(["dr", "dra", "mg", "lic", "bach", "ing", "none"]);
export const GenderCodeSchema = z.enum(["male", "female"]);

export type AssetLinks = z.infer<typeof AssetLinksSchema>;
export type NewsKindCode = z.infer<typeof NewsKindCodeSchema>;
export type NewsStatusCode = z.infer<typeof NewsStatusCodeSchema>;
export type PublicationKindCode = z.infer<typeof PublicationKindCodeSchema>;
export type ThesisKindCode = z.infer<typeof ThesisKindCodeSchema>;
export type ProjectStatusCode = z.infer<typeof ProjectStatusCodeSchema>;
export type CurrencyCode = z.infer<typeof CurrencyCodeSchema>;
export type FundingSourceCode = z.infer<typeof FundingSourceCodeSchema>;
export type RoleCode = z.infer<typeof RoleCodeSchema>;
export type MemberTypeCode = z.infer<typeof MemberTypeCodeSchema>;
export type PrefixCode = z.infer<typeof PrefixCodeSchema>;
export type GenderCode = z.infer<typeof GenderCodeSchema>;
