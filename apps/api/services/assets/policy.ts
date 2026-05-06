import type { OwnerBindingConfig, OwnerType } from "./types.js";

export const OWNER_CONFIG: Record<OwnerType, OwnerBindingConfig> = {
  member: {
    table: "member_asset",
    ownerColumn: "memberId",
    resourceTable: "member",
    slots: ["photo"],
    kindBySlot: { photo: "image" },
  },
  news: {
    table: "news_asset",
    ownerColumn: "newsId",
    resourceTable: "news",
    slots: ["photo"],
    kindBySlot: { photo: "image" },
  },
  method: {
    table: "method_asset",
    ownerColumn: "methodId",
    resourceTable: "method",
    slots: ["photo"],
    kindBySlot: { photo: "image" },
  },
  research_line: {
    table: "research_line_asset",
    ownerColumn: "researchLineId",
    resourceTable: "research_line",
    slots: ["photo"],
    kindBySlot: { photo: "image" },
  },
  publication: {
    table: "publication_asset",
    ownerColumn: "publicationId",
    resourceTable: "publication",
    slots: ["file"],
    kindBySlot: { file: "document" },
  },
  research_group: {
    table: "research_group_asset",
    ownerColumn: "groupId",
    resourceTable: "research_group",
    slots: ["facilities", "header", "footer"],
    kindBySlot: { facilities: "image", header: "brandImage", footer: "brandImage" },
  },
  about: {
    table: "about_asset",
    ownerColumn: "aboutId",
    resourceTable: "about",
    slots: ["photo"],
    kindBySlot: { photo: "image" },
  },
};
