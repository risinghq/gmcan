import type { Kysely } from "kysely";
import { sql } from "kysely";

import type { Database } from "./schema.js";

export const EXPECTED_COLUMNS: Record<string, readonly string[]> = {
  gender: ["id", "name"],
  prefix: ["id", "name"],
  role: ["id", "name"],
  member_type: ["id", "name", "nameEN", "nameSingular", "nameSingularEN"],
  publication_type: ["id", "name", "nameEN"],
  thesis_type: ["id", "name", "nameEN"],
  news_type: ["id", "name", "nameEN"],
  journal: ["id", "name"],
  university: ["id", "name", "nameEN"],
  event: ["id", "name", "city", "country", "cityEN", "countryEN"],
  funding_source: ["id", "name"],
  currency: ["id", "symbol"],
  research_group: [
    "id",
    "summaryES",
    "summaryEN",
    "address",
    "email",
    "phone",
    "name",
    "fullName",
    "facilitiesES",
    "facilitiesEN",
    "futureWorkES",
    "futureWorkEN",
    "publicationsSectionES",
    "publicationsSectionEN",
    "projectsSectionES",
    "projectsSectionEN",
    "createdAt",
    "updatedAt",
  ],
  member: [
    "id",
    "dni",
    "email",
    "password",
    "firstName",
    "lastName",
    "maternalName",
    "birthDate",
    "bio",
    "bioEN",

    "status",
    "resetPassword",
    "createdAt",
    "updatedAt",
    "roleId",
    "memberTypeId",
    "prefixId",
    "genderId",
    "resetToken",
    "resetExpires",
  ],
  session: ["id", "memberId", "email", "expiresAt", "lastActive"],
  research_line: ["id", "name", "nameEN", "description", "descriptionEN", "groupId", "createdAt", "updatedAt"],
  method: ["id", "name", "nameEN", "description", "descriptionEN", "groupId", "createdAt", "updatedAt"],
  equipment: ["id", "name", "cpu", "gpu", "ram", "storage", "groupId", "createdAt", "updatedAt"],
  software: ["id", "name", "description", "descriptionEN", "moreInfo", "groupId", "createdAt", "updatedAt"],
  about: [
    "id",
    "descriptionES",
    "descriptionEN",
    "objectivesContent",
    "servicesContent",
    "homeServicesTeaserContent",
    "createdAt",
    "updatedAt",

    "groupId",
  ],
  news: [
    "id",
    "title",
    "titleEN",
    "summary",
    "summaryEN",
    "body",
    "bodyEN",
    "status",
    "publishedAt",
    "updatedAt",
    "createdAt",

    "priority",
    "authorId",
    "newsTypeId",
  ],
  publication: [
    "id",
    "title",
    "abstractES",
    "abstractEN",
    "journalIssue",
    "doi",
    "publishedAt",
    "updatedAt",
    "createdAt",
    "typeId",
    "journalId",
    "universityId",
    "eventId",
    "thesisTypeId",
  ],
  publication_author: ["id", "publicationId", "isPrincipal", "externalName", "memberId"],
  project: [
    "id",
    "title",
    "titleEN",
    "code",
    "fundedAmount",
    "description",
    "descriptionEN",
    "status",
    "startDate",
    "endDate",
    "createdAt",
    "updatedAt",
    "researchLineId",
    "currencyId",
    "fundingSourceId",
  ],
  member_project: ["projectId", "memberId", "createdAt", "updatedAt"],
  member_group: ["memberId", "groupId", "createdAt", "updatedAt"],
  asset: [
    "id",
    "storageKey",
    "bucket",
    "mimeDetected",
    "ext",
    "sizeBytes",
    "sha256",
    "visibility",
    "status",
    "createdBy",
    "createdAt",
    "deletedAt",
    "deleteAfter",
  ],
  asset_binding: [
    "id",
    "resourceType",
    "resourceId",
    "slot",
    "assetId",
    "isCurrent",
    "replacedByBindingId",
    "replacedAt",
    "createdAt",
    "deletedAt",
  ],
  asset_audit: ["id", "assetId", "bindingId", "action", "actorId", "reason", "createdAt"],
};

export async function createTables(db: Kysely<Database>) {
  await db.schema
    .createTable("gender")
    .ifNotExists()
    .addColumn("id", "integer", (c) => c.primaryKey().autoIncrement().notNull())
    .addColumn("name", "text", (c) => c.notNull())
    .execute();

  await db.schema
    .createTable("prefix")
    .ifNotExists()
    .addColumn("id", "integer", (c) => c.primaryKey().autoIncrement().notNull())
    .addColumn("name", "text", (c) => c.notNull())
    .execute();

  await db.schema
    .createTable("role")
    .ifNotExists()
    .addColumn("id", "integer", (c) => c.primaryKey().autoIncrement().notNull())
    .addColumn("name", "text", (c) => c.notNull())
    .execute();

  await db.schema
    .createTable("member_type")
    .ifNotExists()
    .addColumn("id", "integer", (c) => c.primaryKey().autoIncrement().notNull())
    .addColumn("name", "text", (c) => c.notNull())
    .addColumn("nameEN", "text", (c) => c.notNull())
    .addColumn("nameSingular", "text", (c) => c.notNull())
    .addColumn("nameSingularEN", "text", (c) => c.notNull())
    .execute();

  await db.schema
    .createTable("news_type")
    .ifNotExists()
    .addColumn("id", "integer", (c) => c.primaryKey().autoIncrement().notNull())
    .addColumn("name", "text", (c) => c.notNull())
    .addColumn("nameEN", "text", (c) => c.notNull())
    .execute();

  await db.schema
    .createTable("publication_type")
    .ifNotExists()
    .addColumn("id", "integer", (c) => c.primaryKey().autoIncrement().notNull())
    .addColumn("name", "text", (c) => c.notNull())
    .addColumn("nameEN", "text", (c) => c.notNull())
    .execute();

  await db.schema
    .createTable("thesis_type")
    .ifNotExists()
    .addColumn("id", "integer", (c) => c.primaryKey().autoIncrement().notNull())
    .addColumn("name", "text", (c) => c.notNull())
    .addColumn("nameEN", "text", (c) => c.notNull())
    .execute();

  await db.schema
    .createTable("event")
    .ifNotExists()
    .addColumn("id", "integer", (c) => c.primaryKey().autoIncrement().notNull())
    .addColumn("name", "text", (c) => c.notNull())
    .addColumn("city", "text")
    .addColumn("country", "text")
    .addColumn("cityEN", "text")
    .addColumn("countryEN", "text")
    .execute();

  await db.schema
    .createTable("funding_source")
    .ifNotExists()
    .addColumn("id", "integer", (c) => c.primaryKey().autoIncrement().notNull())
    .addColumn("name", "text", (c) => c.notNull())
    .execute();

  await db.schema
    .createTable("currency")
    .ifNotExists()
    .addColumn("id", "integer", (c) => c.primaryKey().autoIncrement().notNull())
    .addColumn("symbol", "text", (c) => c.notNull())
    .execute();

  await db.schema
    .createTable("journal")
    .ifNotExists()
    .addColumn("id", "integer", (c) => c.primaryKey().autoIncrement().notNull())
    .addColumn("name", "text", (c) => c.notNull())
    .execute();

  await db.schema
    .createTable("university")
    .ifNotExists()
    .addColumn("id", "integer", (c) => c.primaryKey().autoIncrement().notNull())
    .addColumn("name", "text", (c) => c.notNull())
    .addColumn("nameEN", "text", (c) => c.notNull())
    .execute();

  await db.schema
    .createTable("research_group")
    .ifNotExists()
    .addColumn("id", "integer", (c) => c.primaryKey().autoIncrement().notNull())
    .addColumn("summaryES", "text", (c) => c.notNull())
    .addColumn("summaryEN", "text", (c) => c.notNull())
    .addColumn("address", "text")
    .addColumn("email", "text")
    .addColumn("phone", "text")
    .addColumn("name", "text")
    .addColumn("fullName", "text")
    .addColumn("facilitiesES", "text")
    .addColumn("facilitiesEN", "text")
    .addColumn("futureWorkES", "text")
    .addColumn("futureWorkEN", "text")
    .addColumn("publicationsSectionES", "text")
    .addColumn("publicationsSectionEN", "text")
    .addColumn("projectsSectionES", "text")
    .addColumn("projectsSectionEN", "text")
    .addColumn("createdAt", "text", (c) => c.notNull())
    .addColumn("updatedAt", "text", (c) => c.notNull())
    .execute();

  await db.schema
    .createTable("member")
    .ifNotExists()
    .addColumn("id", "integer", (c) => c.primaryKey().autoIncrement().notNull())
    .addColumn("dni", "text", (c) => c.notNull().unique())
    .addColumn("email", "text", (c) => c.notNull().unique())
    .addColumn("password", "text", (c) => c.notNull())
    .addColumn("firstName", "text", (c) => c.notNull())
    .addColumn("lastName", "text", (c) => c.notNull())
    .addColumn("maternalName", "text")
    .addColumn("birthDate", "text")
    .addColumn("bio", "text")
    .addColumn("bioEN", "text")

    .addColumn("status", "integer", (c) => c.notNull())
    .addColumn("resetPassword", "integer", (c) => c.notNull())
    .addColumn("createdAt", "text")
    .addColumn("updatedAt", "text")
    .addColumn("roleId", "integer", (c) => c.notNull().references("role.id"))
    .addColumn("memberTypeId", "integer", (c) => c.notNull().references("member_type.id"))
    .addColumn("prefixId", "integer", (c) => c.references("prefix.id"))
    .addColumn("genderId", "integer", (c) => c.references("gender.id"))
    .addColumn("resetToken", "text")
    .addColumn("resetExpires", "text")
    .execute();

  await db.schema
    .createTable("session")
    .ifNotExists()
    .addColumn("id", "text", (c) => c.primaryKey().notNull())
    .addColumn("memberId", "integer", (c) => c.notNull().references("member.id"))
    .addColumn("email", "text", (c) => c.notNull())
    .addColumn("expiresAt", "text", (c) => c.notNull())
    .addColumn("lastActive", "text", (c) => c.notNull())
    .execute();

  await db.schema
    .createTable("research_line")
    .ifNotExists()
    .addColumn("id", "integer", (c) => c.primaryKey().autoIncrement().notNull())
    .addColumn("name", "text", (c) => c.notNull())
    .addColumn("nameEN", "text", (c) => c.notNull())
    .addColumn("description", "text")
    .addColumn("descriptionEN", "text")

    .addColumn("groupId", "integer", (c) => c.notNull().references("research_group.id"))
    .addColumn("createdAt", "text")
    .addColumn("updatedAt", "text")
    .execute();

  await db.schema
    .createTable("method")
    .ifNotExists()
    .addColumn("id", "integer", (c) => c.primaryKey().autoIncrement().notNull())
    .addColumn("name", "text", (c) => c.notNull())
    .addColumn("nameEN", "text", (c) => c.notNull())
    .addColumn("description", "text", (c) => c.notNull())
    .addColumn("descriptionEN", "text")

    .addColumn("groupId", "integer", (c) => c.notNull().references("research_group.id"))
    .addColumn("createdAt", "text")
    .addColumn("updatedAt", "text")
    .execute();

  await db.schema
    .createTable("equipment")
    .ifNotExists()
    .addColumn("id", "integer", (c) => c.primaryKey().autoIncrement().notNull())
    .addColumn("name", "text", (c) => c.notNull())
    .addColumn("cpu", "text")
    .addColumn("gpu", "text")
    .addColumn("ram", "text")
    .addColumn("storage", "text")
    .addColumn("groupId", "integer", (c) => c.notNull().references("research_group.id"))
    .addColumn("createdAt", "text")
    .addColumn("updatedAt", "text")
    .execute();

  await db.schema
    .createTable("software")
    .ifNotExists()
    .addColumn("id", "integer", (c) => c.primaryKey().autoIncrement().notNull())
    .addColumn("name", "text")
    .addColumn("description", "text")
    .addColumn("descriptionEN", "text")
    .addColumn("moreInfo", "text")
    .addColumn("groupId", "integer", (c) => c.notNull().references("research_group.id"))
    .addColumn("createdAt", "text")
    .addColumn("updatedAt", "text")
    .execute();

  await db.schema
    .createTable("about")
    .ifNotExists()
    .addColumn("id", "integer", (c) => c.primaryKey().autoIncrement().notNull())
    .addColumn("descriptionES", "text", (c) => c.notNull())
    .addColumn("descriptionEN", "text", (c) => c.notNull())
    .addColumn("objectivesContent", "text")
    .addColumn("servicesContent", "text")
    .addColumn("homeServicesTeaserContent", "text")
    .addColumn("createdAt", "text")
    .addColumn("updatedAt", "text")

    .addColumn("groupId", "integer", (c) => c.notNull().references("research_group.id"))
    .execute();

  await db.schema
    .createTable("news")
    .ifNotExists()
    .addColumn("id", "integer", (c) => c.primaryKey().autoIncrement().notNull())
    .addColumn("title", "text", (c) => c.notNull())
    .addColumn("titleEN", "text", (c) => c.notNull())
    .addColumn("summary", "text", (c) => c.notNull())
    .addColumn("summaryEN", "text", (c) => c.notNull())
    .addColumn("body", "text", (c) => c.notNull())
    .addColumn("bodyEN", "text", (c) => c.notNull())
    .addColumn("status", "integer", (c) => c.notNull())
    .addColumn("publishedAt", "text", (c) => c.notNull())
    .addColumn("updatedAt", "text")
    .addColumn("createdAt", "text")

    .addColumn("priority", "integer")
    .addColumn("authorId", "integer", (c) => c.notNull().references("member.id"))
    .addColumn("newsTypeId", "integer", (c) => c.notNull().references("news_type.id"))
    .execute();

  await db.schema
    .createTable("publication")
    .ifNotExists()
    .addColumn("id", "integer", (c) => c.primaryKey().autoIncrement().notNull())
    .addColumn("title", "text", (c) => c.notNull())
    .addColumn("abstractES", "text")
    .addColumn("abstractEN", "text")
    .addColumn("journalIssue", "integer")
    .addColumn("doi", "text")
    .addColumn("publishedAt", "text", (c) => c.notNull())
    .addColumn("updatedAt", "text")
    .addColumn("createdAt", "text")
    .addColumn("typeId", "integer", (c) => c.notNull().references("publication_type.id"))
    .addColumn("journalId", "integer", (c) => c.references("journal.id"))
    .addColumn("universityId", "integer", (c) => c.references("university.id"))
    .addColumn("eventId", "integer", (c) => c.references("event.id"))
    .addColumn("thesisTypeId", "integer", (c) => c.references("thesis_type.id"))
    .execute();

  await db.schema
    .createTable("project")
    .ifNotExists()
    .addColumn("id", "integer", (c) => c.primaryKey().autoIncrement().notNull())
    .addColumn("title", "text", (c) => c.notNull())
    .addColumn("titleEN", "text")
    .addColumn("code", "text", (c) => c.notNull())
    .addColumn("fundedAmount", "text", (c) => c.notNull())
    .addColumn("description", "text", (c) => c.notNull())
    .addColumn("descriptionEN", "text")
    .addColumn("status", "integer")
    .addColumn("startDate", "text", (c) => c.notNull())
    .addColumn("endDate", "text")
    .addColumn("createdAt", "text")
    .addColumn("updatedAt", "text")
    .addColumn("researchLineId", "integer", (c) => c.notNull().references("research_line.id"))
    .addColumn("currencyId", "integer", (c) => c.notNull().references("currency.id"))
    .addColumn("fundingSourceId", "integer", (c) => c.notNull().references("funding_source.id"))
    .execute();

  await db.schema
    .createTable("publication_author")
    .ifNotExists()
    .addColumn("id", "integer", (c) => c.primaryKey().autoIncrement().notNull())
    .addColumn("publicationId", "integer", (c) => c.notNull().references("publication.id"))
    .addColumn("isPrincipal", "integer", (c) => c.notNull())
    .addColumn("externalName", "text")
    .addColumn("memberId", "integer", (c) => c.references("member.id"))
    .execute();

  await db.schema
    .createTable("member_group")
    .ifNotExists()
    .addColumn("memberId", "integer", (c) => c.notNull().references("member.id"))
    .addColumn("groupId", "integer", (c) => c.notNull().references("research_group.id"))
    .addColumn("createdAt", "text", (c) => c.notNull())
    .addColumn("updatedAt", "text", (c) => c.notNull())
    .execute();

  await db.schema
    .createTable("member_project")
    .ifNotExists()
    .addColumn("projectId", "integer", (c) => c.notNull().references("project.id"))
    .addColumn("memberId", "integer", (c) => c.notNull().references("member.id"))
    .addColumn("createdAt", "text")
    .addColumn("updatedAt", "text")
    .execute();

  await db.schema
    .createTable("asset")
    .ifNotExists()
    .addColumn("id", "integer", (c) => c.primaryKey().autoIncrement().notNull())
    .addColumn("storageKey", "text", (c) => c.notNull().unique())
    .addColumn("bucket", "text", (c) => c.notNull())
    .addColumn("mimeDetected", "text", (c) => c.notNull())
    .addColumn("ext", "text", (c) => c.notNull())
    .addColumn("sizeBytes", "integer", (c) => c.notNull())
    .addColumn("sha256", "text", (c) => c.notNull())
    .addColumn("visibility", "text", (c) => c.notNull())
    .addColumn("status", "text", (c) => c.notNull())
    .addColumn("createdBy", "integer", (c) => c.references("member.id"))
    .addColumn("createdAt", "text", (c) => c.notNull())
    .addColumn("deletedAt", "text")
    .addColumn("deleteAfter", "text")
    .execute();

  await db.schema
    .createTable("asset_binding")
    .ifNotExists()
    .addColumn("id", "integer", (c) => c.primaryKey().autoIncrement().notNull())
    .addColumn("resourceType", "text", (c) => c.notNull())
    .addColumn("resourceId", "integer", (c) => c.notNull())
    .addColumn("slot", "text", (c) => c.notNull())
    .addColumn("assetId", "integer", (c) => c.notNull().references("asset.id"))
    .addColumn("isCurrent", "integer", (c) => c.notNull())
    .addColumn("replacedByBindingId", "integer", (c) => c.references("asset_binding.id"))
    .addColumn("replacedAt", "text")
    .addColumn("createdAt", "text", (c) => c.notNull())
    .addColumn("deletedAt", "text")
    .execute();

  await db.schema
    .createTable("asset_audit")
    .ifNotExists()
    .addColumn("id", "integer", (c) => c.primaryKey().autoIncrement().notNull())
    .addColumn("assetId", "integer", (c) => c.references("asset.id"))
    .addColumn("bindingId", "integer", (c) => c.references("asset_binding.id"))
    .addColumn("action", "text", (c) => c.notNull())
    .addColumn("actorId", "integer", (c) => c.references("member.id"))
    .addColumn("reason", "text")
    .addColumn("createdAt", "text", (c) => c.notNull())
    .execute();

  await sql`
    CREATE UNIQUE INDEX IF NOT EXISTS idx_asset_binding_current_unique
    ON asset_binding(resourceType, resourceId, slot)
    WHERE isCurrent = 1 AND deletedAt IS NULL
  `.execute(db);

  await sql`
    CREATE INDEX IF NOT EXISTS idx_asset_binding_lookup
    ON asset_binding(resourceType, resourceId, slot, isCurrent)
  `.execute(db);

  await sql`
    CREATE VIRTUAL TABLE IF NOT EXISTS news_search USING fts5(
      title,
      titleEN,
      summary,
      summaryEN,
      authorName,
      categoryName,
      categoryNameEN
    )
  `.execute(db);

  await sql`
    CREATE INDEX IF NOT EXISTS idx_news_status_published_at
    ON news(status, publishedAt DESC)
  `.execute(db);

  await sql`
    CREATE INDEX IF NOT EXISTS idx_news_type_published_at
    ON news(newsTypeId, publishedAt DESC)
  `.execute(db);

  await sql`
    CREATE INDEX IF NOT EXISTS idx_news_author
    ON news(authorId)
  `.execute(db);

  await sql`
    CREATE TRIGGER IF NOT EXISTS news_ai AFTER INSERT ON news BEGIN
      INSERT INTO news_search(rowid, title, titleEN, summary, summaryEN, authorName, categoryName, categoryNameEN)
      VALUES (
        NEW.id,
        NEW.title,
        NEW.titleEN,
        NEW.summary,
        NEW.summaryEN,
        COALESCE((SELECT TRIM(COALESCE(firstName, '') || ' ' || COALESCE(lastName, '') || ' ' || COALESCE(maternalName, '')) FROM member WHERE id = NEW.authorId), ''),
        COALESCE((SELECT name FROM news_type WHERE id = NEW.newsTypeId), ''),
        COALESCE((SELECT nameEN FROM news_type WHERE id = NEW.newsTypeId), '')
      );
    END
  `.execute(db);

  await sql`
    CREATE TRIGGER IF NOT EXISTS news_au AFTER UPDATE ON news BEGIN
      INSERT OR REPLACE INTO news_search(rowid, title, titleEN, summary, summaryEN, authorName, categoryName, categoryNameEN)
      VALUES (
        NEW.id,
        NEW.title,
        NEW.titleEN,
        NEW.summary,
        NEW.summaryEN,
        COALESCE((SELECT TRIM(COALESCE(firstName, '') || ' ' || COALESCE(lastName, '') || ' ' || COALESCE(maternalName, '')) FROM member WHERE id = NEW.authorId), ''),
        COALESCE((SELECT name FROM news_type WHERE id = NEW.newsTypeId), ''),
        COALESCE((SELECT nameEN FROM news_type WHERE id = NEW.newsTypeId), '')
      );
    END
  `.execute(db);

  await sql`
    CREATE TRIGGER IF NOT EXISTS news_ad AFTER DELETE ON news BEGIN
      DELETE FROM news_search WHERE rowid = OLD.id;
    END
  `.execute(db);

  await sql`
    CREATE TRIGGER IF NOT EXISTS member_au_news_search AFTER UPDATE ON member BEGIN
      UPDATE news_search
      SET authorName = COALESCE(TRIM(COALESCE(NEW.firstName, '') || ' ' || COALESCE(NEW.lastName, '') || ' ' || COALESCE(NEW.maternalName, '')), '')
      WHERE rowid IN (SELECT id FROM news WHERE authorId = NEW.id);
    END
  `.execute(db);

  await sql`
    CREATE TRIGGER IF NOT EXISTS news_type_au_news_search AFTER UPDATE ON news_type BEGIN
      UPDATE news_search
      SET categoryName = COALESCE(NEW.name, ''),
          categoryNameEN = COALESCE(NEW.nameEN, '')
      WHERE rowid IN (SELECT id FROM news WHERE newsTypeId = NEW.id);
    END
  `.execute(db);

  await sql`
    INSERT OR REPLACE INTO news_search(rowid, title, titleEN, summary, summaryEN, authorName, categoryName, categoryNameEN)
    SELECT
      news.id,
      news.title,
      news.titleEN,
      news.summary,
      news.summaryEN,
      COALESCE(TRIM(COALESCE(member.firstName, '') || ' ' || COALESCE(member.lastName, '') || ' ' || COALESCE(member.maternalName, '')), ''),
      COALESCE(news_type.name, ''),
      COALESCE(news_type.nameEN, '')
    FROM news
    LEFT JOIN member ON member.id = news.authorId
    LEFT JOIN news_type ON news_type.id = news.newsTypeId
  `.execute(db);
}
