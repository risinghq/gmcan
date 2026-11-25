import { z } from "zod";

import { CurrencyCodeSchema, FundingSourceCodeSchema, ProjectStatusCodeSchema } from "../public/common.js";
import type { Translations } from "./content.js";

export const ProjectTranslationSchema = z.object({
  title: z.string().trim().min(1),
  description: z.string().trim().min(1),
});
export type ProjectTranslation = z.infer<typeof ProjectTranslationSchema>;

export const ProjectWriteFieldsSchema = z.object({
  code: z.string().trim().min(1),
  fundedAmountMinor: z.number().int().nonnegative(),
  statusCode: ProjectStatusCodeSchema,
  /** `YYYY-MM-DD` dates. */
  startDate: z.string(),
  endDate: z.string().nullable(),
  researchLineId: z.number().int(),
  currencyCode: CurrencyCodeSchema,
  fundingSourceCode: FundingSourceCodeSchema,
  /** The whole membership. A write adds the new members and removes the absent ones. */
  memberIds: z.array(z.number().int()),
});

export interface ProjectWrite extends z.infer<typeof ProjectWriteFieldsSchema> {
  translations: Translations<ProjectTranslation>;
}

export interface AdminProject extends ProjectWrite {
  id: number;
  createdAt: string;
  updatedAt: string;
}
