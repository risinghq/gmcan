import type { AssetOwnerType, AssetTarget } from "@gmcan/contracts/admin";

export type OwnerType = AssetOwnerType;

export type AssetWriteRequest = AssetTarget & { file: File; actorId: number | null };

export type AssetLinks = {
  inline: string;
  download: string;
};

export type AssetDeleteRequest = AssetTarget & { actorId: number | null };

export type OwnerBindingConfig = {
  table:
    | "member_asset"
    | "news_asset"
    | "method_asset"
    | "research_line_asset"
    | "publication_asset"
    | "research_group_asset"
    | "about_asset";
  ownerColumn: "memberId" | "newsId" | "methodId" | "researchLineId" | "publicationId" | "groupId" | "aboutId";
  resourceTable: OwnerType;
  kindBySlot: Record<string, "image" | "brandImage" | "document">;
};
