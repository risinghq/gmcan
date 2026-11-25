import { db } from "../client.js";
import { insertInChunks } from "./chunks.js";
import { seedData } from "./data.js";
import { localeRows, today } from "./rows.js";

const groupId = seedData.group.id;

export async function seedEquipment() {
  await insertInChunks(
    seedData.equipment.map((item) => ({ ...item, groupId, createdAt: today, updatedAt: today })),
    (chunk) =>
      db
        .insertInto("equipment")
        .values(chunk)
        .onConflict((oc) => oc.doNothing()),
  );
}

export async function seedSoftware() {
  const software = seedData.software;
  await db
    .insertInto("software")
    .values(
      software.map((item) => ({ id: item.id, moreInfo: item.moreInfo, groupId, createdAt: today, updatedAt: today })),
    )
    .onConflict((oc) => oc.doNothing())
    .execute();

  await insertInChunks(
    software.flatMap((item) =>
      localeRows(item.translations, (locale, text) => ({ softwareId: item.id, locale, ...text })),
    ),
    (chunk) =>
      db
        .insertInto("software_translation")
        .values(chunk)
        .onConflict((oc) => oc.doNothing()),
  );
}

export async function seedAbout() {
  const about = seedData.about;
  await db
    .insertInto("about")
    .values({ id: about.id, groupId, createdAt: today, updatedAt: today })
    .onConflict((oc) => oc.doNothing())
    .execute();

  await db
    .insertInto("about_translation")
    .values(
      localeRows(about.translations, (locale, text) => ({
        aboutId: about.id,
        locale,
        description: text.description,
        objectivesContent: JSON.stringify(text.objectives),
        servicesContent: JSON.stringify(text.services),
        homeServicesTeaserContent: JSON.stringify(text.homeServicesTeaser),
      })),
    )
    .onConflict((oc) => oc.doNothing())
    .execute();
}
