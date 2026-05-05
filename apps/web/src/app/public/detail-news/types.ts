import type { PublicNewsDetail } from "@app/shared/models/news";

export type DetailNewsViewModel = {
  newsItem: PublicNewsDetail;
  newsTypeNameLabel: string;
  authorNameLabel: string;
  authorPhoto: string | null;
  authorId: number | null;
  day: string;
  month: string;
  year: string;
};
