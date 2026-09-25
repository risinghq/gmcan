import type { Locale } from "../lib/public-locale.js";
import { resolveMemberPhotoView } from "../services/member-photo.service.js";

export async function resolveMemberPhotoUrls(
  memberInputs: Array<{ memberId: number; fullName: string }>,
  locale: Locale,
): Promise<Map<number, { photoUrl: string; photoAlt: string }>> {
  const uniqueInputs = Array.from(new Map(memberInputs.map((input) => [input.memberId, input])).values());
  const resolved = await Promise.all(
    uniqueInputs.map(
      async (input) =>
        [
          input.memberId,
          await resolveMemberPhotoView({ memberId: input.memberId, fullName: input.fullName, locale }),
        ] as const,
    ),
  );
  return new Map<number, { photoUrl: string; photoAlt: string }>(resolved);
}
