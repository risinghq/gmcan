import { zValidator } from "@hono/zod-validator";
import { Hono } from "hono";
import { z } from "zod";

import { deleteUploadedFile, extractFirstFile, saveUploadedFile } from "../../lib/upload.js";
import { requirePermission } from "../../middleware/authz.js";
import {
  createEquipment,
  createSoftware,
  deleteEquipment,
  deleteSoftware,
  getGroupFile,
  listAbout,
  listEquipment,
  listGroups,
  listSoftware,
  setAboutPhoto,
  setGroupFile,
  updateAboutDescription,
  updateAboutObjectives,
  updateAboutServices,
  updateEquipment,
  updateGroupFacilities,
  updateGroupFutureWork,
  updateGroupInfo,
  updateGroupProjectsSection,
  updateGroupPublicationsSection,
  updateGroupSummary,
  updateSoftware,
} from "../../services/group.service.js";

const router = new Hono();
const IdParam = z.object({ id: z.coerce.number().int().positive() });
const SlotParam = z.object({ slot: z.enum(["facilities", "header", "footer"]) });

const SLOT_CONFIG = {
  facilities: { column: "facilitiesPhoto" as const, kind: "image" as const },
  header: { column: "logoHeader" as const, kind: "brandImage" as const },
  footer: { column: "logoFooter" as const, kind: "brandImage" as const },
};

router.use("*", async (c, next) => {
  if (c.req.method === "GET") return requirePermission("content.read")(c, next);
  return requirePermission("content.write")(c, next);
});

router.get("/", async (c) => {
  const rows = await listGroups();
  return c.json(rows);
});

router.put(
  "/:id/info",
  zValidator("param", IdParam),
  zValidator("json", z.object({ email: z.string().optional(), phone: z.string().optional() })),
  async (c) => {
    const { id } = c.req.valid("param");
    const data = c.req.valid("json");
    await updateGroupInfo(id, data);
    return c.json({ status: 1 });
  },
);

router.put(
  "/:id/summary",
  zValidator("param", IdParam),
  zValidator("json", z.object({ summaryES: z.string(), summaryEN: z.string() })),
  async (c) => {
    const { id } = c.req.valid("param");
    const data = c.req.valid("json");
    await updateGroupSummary(id, data);
    return c.json({ status: 1 });
  },
);

router.put(
  "/:id/facilities",
  zValidator("param", IdParam),
  zValidator("json", z.object({ facilitiesES: z.string().optional(), facilitiesEN: z.string().optional() })),
  async (c) => {
    const { id } = c.req.valid("param");
    const data = c.req.valid("json");
    await updateGroupFacilities(id, data);
    return c.json({ status: 1 });
  },
);

router.put(
  "/:id/future-work",
  zValidator("param", IdParam),
  zValidator("json", z.object({ futureWorkES: z.string().optional(), futureWorkEN: z.string().optional() })),
  async (c) => {
    const { id } = c.req.valid("param");
    const data = c.req.valid("json");
    await updateGroupFutureWork(id, data);
    return c.json({ status: 1 });
  },
);

router.put(
  "/:id/publications-section",
  zValidator("param", IdParam),
  zValidator(
    "json",
    z.object({ publicationsSectionES: z.string().optional(), publicationsSectionEN: z.string().optional() }),
  ),
  async (c) => {
    const { id } = c.req.valid("param");
    const data = c.req.valid("json");
    await updateGroupPublicationsSection(id, data);
    return c.json({ status: 1 });
  },
);

router.put(
  "/:id/projects-section",
  zValidator("param", IdParam),
  zValidator("json", z.object({ projectsSectionES: z.string().optional(), projectsSectionEN: z.string().optional() })),
  async (c) => {
    const { id } = c.req.valid("param");
    const data = c.req.valid("json");
    await updateGroupProjectsSection(id, data);
    return c.json({ status: 1 });
  },
);

router.put("/:id/files/:slot", zValidator("param", IdParam.extend(SlotParam.shape)), async (c) => {
  const { id, slot } = c.req.valid("param");
  const config = SLOT_CONFIG[slot];
  const current = await getGroupFile(id, config.column);
  if (!current) return c.json({ error: "Not found" }, 404);

  const body = await c.req.parseBody({ all: true });
  const file = extractFirstFile(body);
  if (!file) return c.json({ error: "No file uploaded" }, 400);
  const fileName = await saveUploadedFile(file, { kind: config.kind });
  if (!fileName) return c.json({ error: "Invalid file type" }, 400);

  const previousFileName = current[config.column];
  await setGroupFile(id, config.column, fileName);
  if (previousFileName && previousFileName !== fileName) {
    await deleteUploadedFile({ fileName: previousFileName });
  }
  return c.json({ status: 1 });
});

// About
router.get("/:id/about", zValidator("param", IdParam), async (c) => {
  const { id } = c.req.valid("param");
  const rows = await listAbout(id);
  return c.json(rows);
});

router.put(
  "/about/:id/description",
  zValidator("param", IdParam),
  zValidator("json", z.object({ descriptionES: z.string(), descriptionEN: z.string() })),
  async (c) => {
    const { id } = c.req.valid("param");
    const data = c.req.valid("json");
    await updateAboutDescription(id, data);
    return c.json({ status: 1 });
  },
);

router.put(
  "/about/:id/objectives",
  zValidator("param", IdParam),
  zValidator("json", z.object({ objectivesES: z.string().optional(), objectivesEN: z.string().optional() })),
  async (c) => {
    const { id } = c.req.valid("param");
    const data = c.req.valid("json");
    await updateAboutObjectives(id, data);
    return c.json({ status: 1 });
  },
);

router.put(
  "/about/:id/services",
  zValidator("param", IdParam),
  zValidator("json", z.object({ servicesES: z.string().optional(), servicesEN: z.string().optional() })),
  async (c) => {
    const { id } = c.req.valid("param");
    const data = c.req.valid("json");
    await updateAboutServices(id, data);
    return c.json({ status: 1 });
  },
);

router.put("/about/:id/photo", zValidator("param", IdParam), async (c) => {
  const { id } = c.req.valid("param");
  const body = await c.req.parseBody({ all: true });
  const file = extractFirstFile(body);
  if (!file) return c.json({ error: "No file uploaded" }, 400);
  const fileName = await saveUploadedFile(file, { kind: "image" });
  if (!fileName) return c.json({ error: "Invalid file type" }, 400);
  await setAboutPhoto(id, fileName);
  return c.json({ status: 1 });
});

// Software
router.get(
  "/:groupId/software",
  zValidator("param", z.object({ groupId: z.coerce.number().int().positive() })),
  async (c) => {
    const { groupId } = c.req.valid("param");
    const rows = await listSoftware(groupId);
    return c.json(rows);
  },
);

router.post(
  "/software",
  zValidator(
    "json",
    z.object({
      name: z.string().optional(),
      description: z.string().optional(),
      descriptionEN: z.string().optional(),
      moreInfo: z.string().optional(),
      groupId: z.number().int(),
    }),
  ),
  async (c) => {
    const data = c.req.valid("json");
    const id = await createSoftware(data);
    return c.json({ id }, 201);
  },
);

router.put(
  "/software/:id",
  zValidator("param", IdParam),
  zValidator(
    "json",
    z.object({
      name: z.string().optional(),
      description: z.string().optional(),
      descriptionEN: z.string().optional(),
      moreInfo: z.string().optional(),
    }),
  ),
  async (c) => {
    const { id } = c.req.valid("param");
    const data = c.req.valid("json");
    await updateSoftware(id, data);
    return c.json({ status: 1 });
  },
);

router.delete("/software/:id", zValidator("param", IdParam), async (c) => {
  const { id } = c.req.valid("param");
  await deleteSoftware(id);
  return c.json({ status: 1 });
});

// Equipment
router.get(
  "/:groupId/equipment",
  zValidator("param", z.object({ groupId: z.coerce.number().int().positive() })),
  async (c) => {
    const { groupId } = c.req.valid("param");
    const rows = await listEquipment(groupId);
    return c.json(rows);
  },
);

router.post(
  "/equipment",
  zValidator(
    "json",
    z.object({
      name: z.string().min(1),
      cpu: z.string().optional(),
      gpu: z.string().optional(),
      ram: z.string().optional(),
      storage: z.string().optional(),
      groupId: z.number().int(),
    }),
  ),
  async (c) => {
    const data = c.req.valid("json");
    const id = await createEquipment(data);
    return c.json({ id }, 201);
  },
);

router.put(
  "/equipment/:id",
  zValidator("param", IdParam),
  zValidator(
    "json",
    z.object({
      name: z.string().min(1),
      cpu: z.string().optional(),
      gpu: z.string().optional(),
      ram: z.string().optional(),
      storage: z.string().optional(),
    }),
  ),
  async (c) => {
    const { id } = c.req.valid("param");
    const data = c.req.valid("json");
    await updateEquipment(id, data);
    return c.json({ status: 1 });
  },
);

router.delete("/equipment/:id", zValidator("param", IdParam), async (c) => {
  const { id } = c.req.valid("param");
  await deleteEquipment(id);
  return c.json({ status: 1 });
});

export default router;
