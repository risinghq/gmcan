import type { OwnerBindingConfig, OwnerType } from "./types.js";

export const OWNER_CONFIG: Record<OwnerType, OwnerBindingConfig> = {
  member: {
    table: "member_asset",
    ownerColumn: "memberId",
    resourceTable: "member",
    kindBySlot: { photo: "image" },
  },
  news: {
    table: "news_asset",
    ownerColumn: "newsId",
    resourceTable: "news",
    kindBySlot: { photo: "image" },
  },
  method: {
    table: "method_asset",
    ownerColumn: "methodId",
    resourceTable: "method",
    kindBySlot: { photo: "image" },
  },
  research_line: {
    table: "research_line_asset",
    ownerColumn: "researchLineId",
    resourceTable: "research_line",
    kindBySlot: { photo: "image" },
  },
  publication: {
    table: "publication_asset",
    ownerColumn: "publicationId",
    resourceTable: "publication",
    kindBySlot: { file: "document" },
  },
  research_group: {
    table: "research_group_asset",
    ownerColumn: "groupId",
    resourceTable: "research_group",
    kindBySlot: { facilities: "image", header: "brandImage", footer: "brandImage" },
  },
  about: {
    table: "about_asset",
    ownerColumn: "aboutId",
    resourceTable: "about",
    kindBySlot: { photo: "image" },
  },
};
