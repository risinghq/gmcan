import type { PublicNewsDetail } from "@app/shared/models/news";

export type DetailNewsViewModel = {
  newsItem: PublicNewsDetail;
  publishedAtLabel: string;
};
