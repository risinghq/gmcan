import type { Locale } from "../lib/public-locale.js";
import { resolveAssetAccessUrl, resolveAssetAccessUrls } from "./assets/service.js";

/** A null photoUrl means the member has no photo; the web draws their initials. */
export type MemberPhotoView = {
  photoUrl: string | null;
  photoAlt: string;
};

export function memberFullName(input: { firstName: string; lastName: string; maternalName: string | null }): string {
  return [input.firstName, input.lastName, input.maternalName].filter(Boolean).join(" ").trim();
}

export function noPhotoView(input: { fullName: string; locale: Locale }): MemberPhotoView {
  const label = input.locale === "es" ? "Foto de perfil" : "Profile photo";
  const connector = input.locale === "es" ? "de" : "of";
  return {
    photoUrl: null,
    photoAlt: input.fullName ? `${label} ${connector} ${input.fullName}` : label,
  };
}

export async function resolveMemberPhotoView(input: {
  memberId: number;
  fullName: string;
  locale: Locale;
}): Promise<MemberPhotoView> {
  const placeholder = noPhotoView(input);
  const assetUrl = await resolveAssetAccessUrl({ ownerType: "member", ownerId: input.memberId, slot: "photo" });

  return { photoUrl: assetUrl ?? placeholder.photoUrl, photoAlt: placeholder.photoAlt };
}

/** Photo views of many members with one asset query per 90 members. The first name given for an id wins. */
export async function resolveMemberPhotoViews(
  members: Array<{ memberId: number; fullName: string }>,
  locale: Locale,
): Promise<Map<number, MemberPhotoView>> {
  const names = new Map<number, string>();
  for (const member of members) if (!names.has(member.memberId)) names.set(member.memberId, member.fullName);

  const urls = await resolveAssetAccessUrls({ ownerType: "member", ownerIds: [...names.keys()], slot: "photo" });
  return new Map(
    [...names].map(([memberId, fullName]) => {
      const placeholder = noPhotoView({ fullName, locale });
      return [memberId, { photoUrl: urls.get(memberId) ?? placeholder.photoUrl, photoAlt: placeholder.photoAlt }];
    }),
  );
}
