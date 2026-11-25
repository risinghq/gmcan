import { db } from "../client.js";
import { seedData, type SeedTopic } from "./data.js";
import { localeRows, today } from "./rows.js";

export async function seedResearchGroup() {
  const group = seedData.group;
  await db
    .insertInto("research_group")
    .values({
      id: group.id,
      slug: group.slug,
      shortName: group.shortName,
      fullName: group.fullName,
      address: group.address,
      email: group.email,
      phone: group.phone,
      createdAt: today,
      updatedAt: today,
    })
    .onConflict((oc) => oc.doNothing())
    .execute();

  await db
    .insertInto("research_group_translation")
    .values(localeRows(group.translations, (locale, text) => ({ groupId: group.id, locale, ...text })))
    .onConflict((oc) => oc.doNothing())
    .execute();
}

function topicRows(topics: SeedTopic[]) {
  return topics.map((topic) => ({ id: topic.id, groupId: seedData.group.id, createdAt: today, updatedAt: today }));
}

export async function seedResearchLines() {
  const lines = seedData.researchLines;
  await db
    .insertInto("research_line")
    .values(topicRows(lines))
    .onConflict((oc) => oc.doNothing())
    .execute();

  await db
    .insertInto("research_line_translation")
    .values(
      lines.flatMap((line) =>
        localeRows(line.translations, (locale, text) => ({ researchLineId: line.id, locale, ...text })),
      ),
    )
    .onConflict((oc) => oc.doNothing())
    .execute();
}

export async function seedMethods() {
  const methods = seedData.methods;
  await db
    .insertInto("method")
    .values(topicRows(methods))
    .onConflict((oc) => oc.doNothing())
    .execute();

  await db
    .insertInto("method_translation")
    .values(
      methods.flatMap((method) =>
        localeRows(method.translations, (locale, text) => ({ methodId: method.id, locale, ...text })),
      ),
    )
    .onConflict((oc) => oc.doNothing())
    .execute();
}
