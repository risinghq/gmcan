import { zValidator } from "@hono/zod-validator";
import { Hono } from "hono";
import { z } from "zod";

import { localizeField } from "../../lib/public-locale.js";
import { resolveAssetAccessUrl } from "../../services/asset.service.js";
import { getMemberProfile, listMembers } from "../../services/member.service.js";

const router = new Hono();
const IdParam = z.object({ id: z.coerce.number().int().positive() });

router.get("/", async (c) => {
  const locale = c.get("locale");
  const rows = await listMembers();
  const shaped = await Promise.all(
    rows.map(async (row) =>
      Object.assign({}, row, {
        bio: localizeField(row, locale, { es: "bio", en: "bioEN", required: false }),
        asset: await resolveAssetAccessUrl({ resourceType: "member", resourceId: row.id, slot: "photo" }),
      }),
    ),
  );
  return c.json(shaped);
});

router.get("/:id", zValidator("param", IdParam), async (c) => {
  const locale = c.get("locale");
  const { id } = c.req.valid("param");
  const profile = await getMemberProfile(id);
  if (!profile.member) return c.json({ error: "Not found" }, 404);

  const member = {
    ...profile.member,
    bio: localizeField(profile.member, locale, { es: "bio", en: "bioEN", required: false }),
    asset: await resolveAssetAccessUrl({ resourceType: "member", resourceId: profile.member.id, slot: "photo" }),
  };

  const publications = await Promise.all(
    profile.publications.map(async (publication) => ({
      ...publication,
      asset: await resolveAssetAccessUrl({ resourceType: "publication", resourceId: publication.id, slot: "file" }),
    })),
  );

  return c.json({
    ...profile,
    member,
    projects: profile.projects,
    publications,
  });
});

export default router;
