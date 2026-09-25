import fs from "node:fs/promises";
import path from "node:path";

import { Hono } from "hono";

const router = new Hono();

router.get("/member-photo", async (c) => {
  const filePath = path.resolve(process.cwd(), "assets/member-photo-placeholder.png");
  const data = await fs.readFile(filePath);
  return c.body(data, 200, {
    "Content-Type": "image/png",
    "Cache-Control": "public, max-age=31536000, immutable",
  });
});

export default router;
