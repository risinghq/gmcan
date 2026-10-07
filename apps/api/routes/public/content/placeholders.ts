import { Hono } from "hono";

import { serveAsset } from "../../../lib/upload.js";

export const MEMBER_PHOTO_PLACEHOLDER_KEY = "placeholders/member-photo.png";

const router = new Hono();

router.get("/member-photo", (c) => serveAsset(c, { assetKey: MEMBER_PHOTO_PLACEHOLDER_KEY }));

export default router;
