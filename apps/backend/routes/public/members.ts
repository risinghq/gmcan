import { zValidator } from "@hono/zod-validator";
import { Hono } from "hono";
import { z } from "zod";

import { assetUrl } from "../../lib/upload.js";
import { localizeField } from "../../lib/public-locale.js";
import { getMemberProfile, listMembers } from "../../services/member.service.js";

const router = new Hono();
const IdParam = z.object({ id: z.coerce.number().int().positive() });

router.get("/", async (c) => {
  const locale = c.get("locale");
  const rows = await listMembers();
  return c.json(
    rows.map((row) => {
      return {
        ...row,
        bio: localizeField(row, locale, { es: "bio", en: "bioEN", required: false }),
        photoUrl: assetUrl(row.photo),
      };
    }),
  );
});

router.get("/:id", zValidator("param", IdParam), async (c) => {
  const locale = c.get("locale");
  const { id } = c.req.valid("param");
  const profile = await getMemberProfile(id);
  if (!profile.member) return c.json({ error: "Not found" }, 404);
  return c.json({
    ...profile,
    member: {
      ...profile.member,
      bio: localizeField(profile.member, locale, { es: "bio", en: "bioEN", required: false }),
      photoUrl: assetUrl(profile.member.photo),
    },
    projects: profile.projects,
    publications: profile.publications.map((publication) => ({
      ...publication,
      fileUrl: assetUrl(publication.file),
    })),
  });
});

export default router;
