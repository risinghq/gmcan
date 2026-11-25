import { z } from "zod";

import { GenderCodeSchema, MemberTypeCodeSchema, PrefixCodeSchema, RoleCodeSchema } from "../public/common.js";
import type { Translations } from "./content.js";

export const MemberTranslationSchema = z.object({ bio: z.string().trim().max(500) });
export type MemberTranslation = z.infer<typeof MemberTranslationSchema>;

export const MemberProfileFieldsSchema = z.object({
  email: z.email(),
  /** The given names, a middle name included. */
  firstName: z.string().trim().min(1),
  lastName: z.string().trim().min(1),
  maternalName: z.string().trim().nullable(),
  /** A `YYYY-MM-DD` date. */
  birthDate: z.string().nullable(),
  prefixCode: PrefixCodeSchema.nullable(),
  genderCode: GenderCodeSchema.nullable(),
});

export interface MemberProfileWrite extends z.infer<typeof MemberProfileFieldsSchema> {
  translations: Translations<MemberTranslation>;
}

export const MemberAdminFieldsSchema = MemberProfileFieldsSchema.extend({
  isActive: z.union([z.literal(0), z.literal(1)]),
  roleCode: RoleCodeSchema,
  memberTypeCode: MemberTypeCodeSchema,
});

/** The DNI is fixed at creation. */
export interface MemberWrite extends z.infer<typeof MemberAdminFieldsSchema> {
  translations: Translations<MemberTranslation>;
}

export const MemberCreateFieldsSchema = MemberAdminFieldsSchema.extend({
  dni: z.string().trim().min(1),
  password: z.string().min(1),
});

export interface MemberCreate extends z.infer<typeof MemberCreateFieldsSchema> {
  translations: Translations<MemberTranslation>;
}

export interface AdminMember extends MemberWrite {
  id: number;
  dni: string;
  photoUrl: string;
  photoAlt: string;
}
