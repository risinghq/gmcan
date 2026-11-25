import { z } from "zod";

import { PublicNewsListItemSchema } from "./news.js";
import { PublicProjectSchema } from "./project.js";
import { PublicationCountsSchema, PublicPublicationWithAuthorsSchema } from "./publication.js";

export const PublicGroupTopicSchema = z.object({
  id: z.number(),
  name: z.string(),
  description: z.string().nullable(),
  asset: z.string().nullable(),
  groupId: z.number(),
  createdAt: z.string().nullable(),
  updatedAt: z.string().nullable(),
});

export const HOME_PUBLICATIONS = 5;
export const HOME_PROJECTS = 5;
export const HOME_NEWS = 3;

/** What the home page shows: recent items only, and counts instead of the lists they summarize. */
export const PublicHomeSchema = z.object({
  memberCount: z.number().int().nonnegative(),
  publicationCounts: PublicationCountsSchema,
  publications: z.array(PublicPublicationWithAuthorsSchema).max(HOME_PUBLICATIONS),
  ongoingProjects: z.array(PublicProjectSchema).max(HOME_PROJECTS),
  news: z.array(PublicNewsListItemSchema).max(HOME_NEWS),
  researchLines: z.array(PublicGroupTopicSchema),
  methods: z.array(PublicGroupTopicSchema),
  servicesTeaser: z.array(z.string()),
});

export type PublicGroupTopic = z.infer<typeof PublicGroupTopicSchema>;
export type PublicHome = z.infer<typeof PublicHomeSchema>;
