import { resolveAssetAccessUrl } from "../services/assets/service.js";

export async function resolveMemberPhotoUrls(memberIds: number[]): Promise<Map<number, string | null>> {
  const uniqueIds = Array.from(new Set(memberIds));
  const resolved = await Promise.all(
    uniqueIds.map(
      async (memberId) =>
        [memberId, await resolveAssetAccessUrl({ ownerType: "member", ownerId: memberId, slot: "photo" })] as const,
    ),
  );
  return new Map<number, string | null>(resolved);
}
