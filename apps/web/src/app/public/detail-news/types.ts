import type { PublicNewsDetail } from "@app/shared/models/news";

export type DetailNewsViewModel = {
  newsItem: PublicNewsDetail;
  newsTypeNameLabel: string;
  authorNameLabel: string;
  authorId: number | null;
  writtenOn: string;
};
