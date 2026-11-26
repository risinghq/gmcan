import { z } from "zod";

import { CurrencyCodeSchema, FundingSourceCodeSchema, ProjectStatusCodeSchema } from "./common.js";

export const PublicProjectMemberSchema = z.object({
  memberId: z.number(),
  name: z.string(),
  photoUrl: z.string().nullable(),
  photoAlt: z.string(),
});

export const PublicProjectSchema = z.object({
  id: z.number(),
  title: z.string(),
  code: z.string(),
  fundedAmountMinor: z.number(),
  description: z.string(),
  statusCode: ProjectStatusCodeSchema,
  startDate: z.string(),
  endDate: z.string().nullable(),
  researchLineId: z.number(),
  currencyCode: CurrencyCodeSchema,
  fundingSourceCode: FundingSourceCodeSchema,
  createdAt: z.string().nullable(),
  updatedAt: z.string().nullable(),
  members: z.array(PublicProjectMemberSchema),
});

export type PublicProjectMember = z.infer<typeof PublicProjectMemberSchema>;
export type PublicProject = z.infer<typeof PublicProjectSchema>;
