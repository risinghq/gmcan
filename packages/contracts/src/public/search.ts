import { z } from "zod";

import { CurrencyCodeSchema, FundingSourceCodeSchema, NewsKindCodeSchema, NewsStatusCodeSchema, ProjectStatusCodeSchema } from "./common.js";
import { PublicMemberSchema } from "./member.js";
import { PublicProjectMemberSchema } from "./project.js";
import { PublicPublicationWithAuthorsSchema } from "./publication.js";

export const GlobalSearchResultsSchema = z.object({
  publications: z.array(PublicPublicationWithAuthorsSchema.omit({ updatedAt: true, createdAt: true })),
  members: z.array(PublicMemberSchema),
  news: z.array(
    z.object({
      id: z.number(),
      title: z.string(),
      publishedAt: z.string(),
      asset: z.string().nullable(),
      newsKindCode: NewsKindCodeSchema,
      statusCode: NewsStatusCodeSchema,
      authorName: z.string(),
    }),
  ),
  projects: z.array(
    z.object({
      id: z.number(),
      title: z.string(),
      code: z.string(),
      fundedAmountMinor: z.number(),
      description: z.string(),
      statusCode: ProjectStatusCodeSchema,
      startDate: z.string(),
      endDate: z.string().nullable(),
      researchLineId: z.number(),
      fundingSourceCode: FundingSourceCodeSchema,
      currencyCode: CurrencyCodeSchema,
      researchLine: z.string(),
      fundingSource: z.string(),
      members: z.array(PublicProjectMemberSchema),
    }),
  ),
});

export type GlobalSearchResults = z.infer<typeof GlobalSearchResultsSchema>;
