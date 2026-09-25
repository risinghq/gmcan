import { getBackendUrl } from "../config.js";
import type { Locale } from "../lib/public-locale.js";
import { resolveAssetAccessUrl } from "./assets/service.js";

const MEMBER_PHOTO_FALLBACK_URL = `${getBackendUrl()}/api/placeholders/member-photo`;

export type MemberPhotoView = {
  photoUrl: string;
  photoAlt: string;
};

export function memberFullName(input: { firstName: string; lastName: string; maternalName: string | null }): string {
  return [input.firstName, input.lastName, input.maternalName].filter(Boolean).join(" ").trim();
}

export function memberPhotoPlaceholderView(input: { fullName: string; locale: Locale }): MemberPhotoView {
  const label = input.locale === "es" ? "Foto de perfil" : "Profile photo";
  const connector = input.locale === "es" ? "de" : "of";
  return {
    photoUrl: MEMBER_PHOTO_FALLBACK_URL,
    photoAlt: input.fullName ? `${label} ${connector} ${input.fullName}` : label,
  };
}

export async function resolveMemberPhotoView(input: {
  memberId: number;
  fullName: string;
  locale: Locale;
}): Promise<MemberPhotoView> {
  const placeholder = memberPhotoPlaceholderView(input);
  const assetUrl = await resolveAssetAccessUrl({ ownerType: "member", ownerId: input.memberId, slot: "photo" });

  return { photoUrl: assetUrl ?? placeholder.photoUrl, photoAlt: placeholder.photoAlt };
}
