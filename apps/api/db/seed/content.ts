import { db } from "../client.js";
import { insertInChunks } from "./chunks.js";
import { seedData } from "./data.js";
import { memberIdsByEmail } from "./members.js";
import { localeRows, today } from "./rows.js";

function memberId(ids: Map<string, number>, email: string): number {
  const id = ids.get(email);
  if (id === undefined) throw new Error(`Seed member not found: ${email}`);
  return id;
}

export async function seedNews() {
  const news = seedData.news;
  const members = await memberIdsByEmail();

  await insertInChunks(
    news.map((item) => ({
      id: item.id,
      statusCode: item.statusCode,
      publishedAt: item.publishedAt,
      priority: null,
      authorId: memberId(members, item.authorEmail),
      newsKindCode: item.newsKindCode,
      createdAt: item.publishedAt,
      updatedAt: item.publishedAt,
    })),
    (chunk) =>
      db
        .insertInto("news")
        .values(chunk)
        .onConflict((oc) => oc.doNothing()),
  );

  await insertInChunks(
    news.flatMap((item) => localeRows(item.translations, (locale, text) => ({ newsId: item.id, locale, ...text }))),
    (chunk) =>
      db
        .insertInto("news_translation")
        .values(chunk)
        .onConflict((oc) => oc.doNothing()),
  );
}

export async function seedJournals() {
  await insertInChunks(seedData.journals, (chunk) =>
    db
      .insertInto("journal")
      .values(chunk)
      .onConflict((oc) => oc.doNothing()),
  );
}

export async function seedUniversities() {
  const universities = seedData.universities;
  await db
    .insertInto("university")
    .values(universities.map((university) => ({ id: university.id })))
    .onConflict((oc) => oc.doNothing())
    .execute();

  await db
    .insertInto("university_translation")
    .values(
      universities.flatMap((university) =>
        localeRows(university.name, (locale, name) => ({ universityId: university.id, locale, name })),
      ),
    )
    .onConflict((oc) => oc.doNothing())
    .execute();
}

export async function seedEvents() {
  const events = seedData.events;
  await db
    .insertInto("event")
    .values(events.map((event) => ({ id: event.id })))
    .onConflict((oc) => oc.doNothing())
    .execute();

  await insertInChunks(
    events.flatMap((event) =>
      localeRows(event.translations, (locale, text) => ({ eventId: event.id, locale, ...text })),
    ),
    (chunk) =>
      db
        .insertInto("event_translation")
        .values(chunk)
        .onConflict((oc) => oc.doNothing()),
  );
}

export async function seedProjects() {
  const projects = seedData.projects;
  const members = await memberIdsByEmail();

  await insertInChunks(
    projects.map((project) => ({
      id: project.id,
      code: project.code,
      fundedAmountMinor: project.fundedAmountMinor,
      statusCode: project.statusCode,
      startDate: project.startDate,
      endDate: project.endDate,
      researchLineId: project.researchLineId,
      currencyCode: project.currencyCode,
      fundingSourceCode: project.fundingSourceCode,
      createdAt: today,
      updatedAt: today,
    })),
    (chunk) =>
      db
        .insertInto("project")
        .values(chunk)
        .onConflict((oc) => oc.doNothing()),
  );

  await insertInChunks(
    projects.flatMap((project) =>
      localeRows(project.translations, (locale, text) => ({ projectId: project.id, locale, ...text })),
    ),
    (chunk) =>
      db
        .insertInto("project_translation")
        .values(chunk)
        .onConflict((oc) => oc.doNothing()),
  );

  await insertInChunks(
    projects.flatMap((project) =>
      project.memberEmails.map((email) => ({
        projectId: project.id,
        memberId: memberId(members, email),
        createdAt: today,
        updatedAt: today,
      })),
    ),
    (chunk) =>
      db
        .insertInto("project_member")
        .values(chunk)
        .onConflict((oc) => oc.doNothing()),
  );
}

export async function seedPublications() {
  const publications = seedData.publications;
  const members = await memberIdsByEmail();

  await insertInChunks(
    publications.map((publication) => ({
      id: publication.id,
      kindCode: publication.kindCode,
      doi: publication.doi,
      publishedAt: publication.publishedAt,
      createdAt: today,
      updatedAt: today,
    })),
    (chunk) =>
      db
        .insertInto("publication")
        .values(chunk)
        .onConflict((oc) => oc.doNothing()),
  );

  await insertInChunks(
    publications.flatMap((publication) =>
      publication.kindCode === "journal_article"
        ? [{ publicationId: publication.id, journalId: publication.journalId, issue: publication.issue }]
        : [],
    ),
    (chunk) =>
      db
        .insertInto("journal_article")
        .values(chunk)
        .onConflict((oc) => oc.doNothing()),
  );

  await insertInChunks(
    publications.flatMap((publication) =>
      publication.kindCode === "conference_paper"
        ? [{ publicationId: publication.id, eventId: publication.eventId }]
        : [],
    ),
    (chunk) =>
      db
        .insertInto("conference_paper")
        .values(chunk)
        .onConflict((oc) => oc.doNothing()),
  );

  await insertInChunks(
    publications.flatMap((publication) =>
      publication.kindCode === "thesis"
        ? [
            {
              publicationId: publication.id,
              universityId: publication.universityId,
              thesisKindCode: publication.thesisKindCode,
            },
          ]
        : [],
    ),
    (chunk) =>
      db
        .insertInto("thesis")
        .values(chunk)
        .onConflict((oc) => oc.doNothing()),
  );

  await insertInChunks(
    publications.flatMap((publication) =>
      localeRows(publication.translations, (locale, text) => ({ publicationId: publication.id, locale, ...text })),
    ),
    (chunk) =>
      db
        .insertInto("publication_translation")
        .values(chunk)
        .onConflict((oc) => oc.doNothing()),
  );

  await insertInChunks(
    publications.flatMap((publication) =>
      publication.authors.map((author, index) => ({
        publicationId: publication.id,
        authorOrder: index + 1,
        memberId: "email" in author ? memberId(members, author.email) : null,
        externalName: "name" in author ? author.name : null,
      })),
    ),
    (chunk) =>
      db
        .insertInto("publication_author")
        .values(chunk)
        .onConflict((oc) => oc.doNothing()),
  );
}
