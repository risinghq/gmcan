import { zValidator } from "@hono/zod-validator";
import { Hono } from "hono";
import { z } from "zod";

import { serveUploadedFile } from "../../lib/upload.js";

const router = new Hono();
const Params = z.object({ fileName: z.string().min(1) });
const Query = z.object({ download: z.coerce.boolean().optional() });

router.get("/:fileName", zValidator("param", Params), zValidator("query", Query), async (c) => {
  const { fileName } = c.req.valid("param");
  const { download } = c.req.valid("query");
  return serveUploadedFile(c, { fileName, asAttachment: download });
});

export default router;
