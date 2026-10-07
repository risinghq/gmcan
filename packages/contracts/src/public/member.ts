import { z } from "zod";

import { MemberTypeCodeSchema, PrefixCodeSchema, RoleCodeSchema } from "./common.js";
import { PublicProjectSchema } from "./project.js";
import { PublicPublicationWithAuthorsSchema } from "./publication.js";

export const PublicMemberSchema = z.object({
  id: z.number(),
  firstName: z.string(),
  lastName: z.string(),
  maternalName: z.string().nullable(),
  bio: z.string().nullable(),
  photoUrl: z.string(),
  photoAlt: z.string(),
  isActive: z.number(),
  roleCode: RoleCodeSchema,
  memberTypeCode: MemberTypeCodeSchema,
  prefixCode: PrefixCodeSchema.nullable(),
});

export const PublicMemberProfileSchema = z.object({
  member: PublicMemberSchema,
  projects: z.array(PublicProjectSchema),
  publications: z.array(PublicPublicationWithAuthorsSchema),
});

export type PublicMember = z.infer<typeof PublicMemberSchema>;
export type PublicMemberProfile = z.infer<typeof PublicMemberProfileSchema>;
