import { Hono } from "hono";
import { z } from "zod";

import { notFound } from "../../../lib/errors/app-error.js";
import { validate } from "../../../lib/validate.js";
import {
  memberFullName,
  resolveMemberPhotoView,
  resolveMemberPhotoViews,
} from "../../../services/member-photo.service.js";
import { getMemberProfileLocalized, listMembersLocalized } from "../../../services/member.service.js";

const router = new Hono();
const IdParam = z.object({ id: z.coerce.number().int().positive() });

router.get("/", async (c) => {
  const locale = c.get("locale");
  const rows = await listMembersLocalized(locale);
  const photos = await resolveMemberPhotoViews(
    rows.map((row) => ({ memberId: row.id, fullName: memberFullName(row) })),
    locale,
  );
  return c.json(rows.map((row) => Object.assign({}, row, photos.get(row.id))));
});

router.get("/:id", validate("param", IdParam), async (c) => {
  const locale = c.get("locale");
  const { id } = c.req.valid("param");
  const profile = await getMemberProfileLocalized(id, locale);
  if (!profile.member) throw notFound();

  const member = {
    ...profile.member,
    ...(await resolveMemberPhotoView({
      memberId: profile.member.id,
      fullName: memberFullName(profile.member),
      locale,
    })),
  };

  return c.json({ ...profile, member });
});

export default router;
