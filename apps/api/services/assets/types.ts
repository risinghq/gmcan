export type OwnerType = "member" | "news" | "method" | "research_line" | "publication" | "research_group" | "about";

export type SlotByOwner = {
  member: "photo";
  news: "photo";
  method: "photo";
  research_line: "photo";
  publication: "file";
  research_group: "facilities" | "header" | "footer";
  about: "photo";
};

export type AnySlot = SlotByOwner[keyof SlotByOwner];

export type AssetWriteRequest<T extends OwnerType = OwnerType> = {
  ownerType: T;
  ownerId: number;
  slot: SlotByOwner[T];
  file: File;
  actorId: number | null;
};

export type AssetDeleteRequest<T extends OwnerType = OwnerType> = {
  ownerType: T;
  ownerId: number;
  slot: SlotByOwner[T];
  actorId: number | null;
};

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
  slots: readonly AnySlot[];
  kindBySlot: Record<string, "image" | "brandImage" | "document">;
};
