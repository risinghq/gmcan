import { zValidator } from "@hono/zod-validator";
import { Hono } from "hono";
import { z } from "zod";

import { resolveAssetAccessUrl } from "../../services/assets/service.js";
import { getMemberProfileLocalized, listMembersLocalized } from "../../services/member.service.js";

const router = new Hono();
const IdParam = z.object({ id: z.coerce.number().int().positive() });

router.get("/", async (c) => {
  const locale = c.get("locale");
  const rows = await listMembersLocalized(locale);
  const shaped = await Promise.all(
    rows.map(async (row) =>
      Object.assign({}, row, {
        asset: await resolveAssetAccessUrl({ ownerType: "member", ownerId: row.id, slot: "photo" }),
      }),
    ),
  );
  return c.json(shaped);
});

router.get("/:id", zValidator("param", IdParam), async (c) => {
  const locale = c.get("locale");
  const { id } = c.req.valid("param");
  const profile = await getMemberProfileLocalized(id, locale);
  if (!profile.member) return c.json({ error: "Not found" }, 404);

  const member = {
    ...profile.member,
    asset: await resolveAssetAccessUrl({ ownerType: "member", ownerId: profile.member.id, slot: "photo" }),
  };

  const publications = await Promise.all(
    profile.publications.map(async (publication) => ({
      ...publication,
      asset: await resolveAssetAccessUrl({ ownerType: "publication", ownerId: publication.id, slot: "file" }),
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
