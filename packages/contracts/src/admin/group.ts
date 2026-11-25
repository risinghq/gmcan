import { z } from "zod";

import type { Translations } from "./content.js";

const line = z.string().trim().min(1);

/** A titled block on the about page: lead paragraphs, then a bullet list. */
export const AboutSectionSchema = z.object({
  introParagraphs: z.array(line),
  items: z.array(line),
});
export type AboutSection = z.infer<typeof AboutSectionSchema>;

export const HomeTeaserSchema = z.object({ paragraphs: z.array(line).min(1) });
export type HomeTeaser = z.infer<typeof HomeTeaserSchema>;

/** An empty optional section is stored as absent, so the public site hides it. */
export const GroupTranslationSchema = z.object({
  summary: line,
  facilities: z.string(),
  futureWork: z.string(),
  publicationsSection: z.string(),
  projectsSection: z.string(),
});
export type GroupTranslation = z.infer<typeof GroupTranslationSchema>;

export const GroupFieldsSchema = z.object({
  email: z.string().trim(),
  phone: z.string().trim(),
});
export type GroupFields = z.infer<typeof GroupFieldsSchema>;

export const AboutTranslationSchema = z.object({
  description: line,
  objectivesContent: AboutSectionSchema,
  servicesContent: AboutSectionSchema,
  homeServicesTeaserContent: HomeTeaserSchema,
});
export type AboutTranslation = z.infer<typeof AboutTranslationSchema>;

/** A write replaces every field and translation of the group. */
export interface GroupWrite extends GroupFields {
  translations: Translations<GroupTranslation>;
}

/** A write replaces every translation of the about page. */
export interface AboutWrite {
  translations: Translations<AboutTranslation>;
}

export interface AdminGroup extends GroupFields {
  id: number;
  shortName: string;
  fullName: string;
  assets: { facilities: string | null; header: string | null; footer: string | null };
  translations: Translations<GroupTranslation>;
}

export interface AdminAbout {
  id: number;
  groupId: number;
  asset: string | null;
  translations: Translations<AboutTranslation>;
}
