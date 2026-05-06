import type { Kysely } from "kysely";
import { sql } from "kysely";

import type { Database } from "./schema.js";

export const EXPECTED_COLUMNS: Record<string, readonly string[]> = {
  locale: ["code"],
  gender: ["id", "name"],
  prefix: ["id", "name"],
  role: ["id", "name"],
  member_type: ["id"],
  member_type_translation: ["id", "memberTypeId", "locale", "name", "nameSingular"],
  publication_type: ["id"],
  publication_type_translation: ["id", "publicationTypeId", "locale", "name"],
  thesis_type: ["id"],
  thesis_type_translation: ["id", "thesisTypeId", "locale", "name"],
  news_type: ["id"],
  news_type_translation: ["id", "newsTypeId", "locale", "name"],
  journal: ["id", "name"],
  university: ["id"],
  university_translation: ["id", "universityId", "locale", "name"],
  event: ["id"],
  event_translation: ["id", "eventId", "locale", "name", "city", "country"],
  funding_source: ["id", "name"],
  currency: ["id", "symbol"],
  research_group: ["id", "address", "email", "phone", "name", "fullName", "createdAt", "updatedAt"],
  member: [
    "id",
    "dni",
    "email",
    "password",
    "firstName",
    "lastName",
    "maternalName",
    "birthDate",

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
  member_translation: ["id", "memberId", "locale", "bio"],
  session: ["id", "memberId", "email", "expiresAt", "lastActive"],
  research_line: ["id", "groupId", "createdAt", "updatedAt"],
  research_line_translation: ["id", "researchLineId", "locale", "name", "description"],
  method: ["id", "groupId", "createdAt", "updatedAt"],
  method_translation: ["id", "methodId", "locale", "name", "description"],
  equipment: ["id", "name", "cpu", "gpu", "ram", "storage", "groupId", "createdAt", "updatedAt"],
  software: ["id", "moreInfo", "groupId", "createdAt", "updatedAt"],
  software_translation: ["id", "softwareId", "locale", "name", "description"],
  about: ["id", "createdAt", "updatedAt", "groupId"],
  about_translation: [
    "id",
    "aboutId",
    "locale",
    "description",
    "objectivesContent",
    "servicesContent",
    "homeServicesTeaserContent",
  ],
  group_translation: [
    "id",
    "groupId",
    "locale",
    "summary",
    "facilities",
    "futureWork",
    "publicationsSection",
    "projectsSection",
  ],
  news: [
    "id",
    "status",
    "publishedAt",
    "updatedAt",
    "createdAt",

    "priority",
    "authorId",
    "newsTypeId",
  ],
  news_translation: ["id", "newsId", "locale", "title", "summary", "body"],
  publication: [
    "id",
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
  publication_translation: ["id", "publicationId", "locale", "title", "abstract"],
  publication_author: ["id", "publicationId", "isPrincipal", "externalName", "memberId"],
  project: [
    "id",
    "code",
    "fundedAmount",
    "status",
    "startDate",
    "endDate",
    "createdAt",
    "updatedAt",
    "researchLineId",
    "currencyId",
    "fundingSourceId",
  ],
  project_translation: ["id", "projectId", "locale", "title", "description"],
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
  asset_binding_history: [
    "id",
    "resourceType",
    "resourceId",
    "slot",
    "assetId",
    "version",
    "actorId",
    "reason",
    "createdAt",
  ],
  asset_binding_current: ["resourceType", "resourceId", "slot", "bindingId", "updatedAt"],
  asset_audit: ["id", "assetId", "bindingId", "action", "actorId", "reason", "createdAt"],
};

async function createIdTable(db: Kysely<Database>, table: string) {
  await db.schema
    .createTable(table)
    .ifNotExists()
    .addColumn("id", "integer", (c) => c.primaryKey().autoIncrement().notNull())
    .execute();
}

async function createNameTranslationTable(
  db: Kysely<Database>,
  table: string,
  ownerTable: string,
  ownerColumn: string,
  uniqueConstraintName: string,
) {
  await db.schema
    .createTable(table)
    .ifNotExists()
    .addColumn("id", "integer", (c) => c.primaryKey().autoIncrement().notNull())
    .addColumn(ownerColumn, "integer", (c) => c.notNull().references(`${ownerTable}.id`).onDelete("cascade"))
    .addColumn("locale", "text", (c) => c.notNull().references("locale.code").onDelete("restrict"))
    .addColumn("name", "text", (c) => c.notNull())
    .addUniqueConstraint(uniqueConstraintName, [ownerColumn, "locale"])
    .execute();
}

export async function createTables(db: Kysely<Database>) {
  await db.schema
    .createTable("locale")
    .ifNotExists()
    .addColumn("code", "text", (c) => c.primaryKey().notNull())
    .execute();

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

  await createIdTable(db, "member_type");
  await db.schema
    .createTable("member_type_translation")
    .ifNotExists()
    .addColumn("id", "integer", (c) => c.primaryKey().autoIncrement().notNull())
    .addColumn("memberTypeId", "integer", (c) => c.notNull().references("member_type.id").onDelete("cascade"))
    .addColumn("locale", "text", (c) => c.notNull().references("locale.code").onDelete("restrict"))
    .addColumn("name", "text", (c) => c.notNull())
    .addColumn("nameSingular", "text", (c) => c.notNull())
    .addUniqueConstraint("member_type_translation_owner_locale_unique", ["memberTypeId", "locale"])
    .execute();

  await createIdTable(db, "news_type");
  await createNameTranslationTable(
    db,
    "news_type_translation",
    "news_type",
    "newsTypeId",
    "news_type_translation_owner_locale_unique",
  );

  await createIdTable(db, "publication_type");
  await createNameTranslationTable(
    db,
    "publication_type_translation",
    "publication_type",
    "publicationTypeId",
    "publication_type_translation_owner_locale_unique",
  );

  await createIdTable(db, "thesis_type");
  await createNameTranslationTable(
    db,
    "thesis_type_translation",
    "thesis_type",
    "thesisTypeId",
    "thesis_type_translation_owner_locale_unique",
  );

  await createIdTable(db, "event");
  await db.schema
    .createTable("event_translation")
    .ifNotExists()
    .addColumn("id", "integer", (c) => c.primaryKey().autoIncrement().notNull())
    .addColumn("eventId", "integer", (c) => c.notNull().references("event.id").onDelete("cascade"))
    .addColumn("locale", "text", (c) => c.notNull().references("locale.code").onDelete("restrict"))
    .addColumn("name", "text", (c) => c.notNull())
    .addColumn("city", "text")
    .addColumn("country", "text")
    .addUniqueConstraint("event_translation_owner_locale_unique", ["eventId", "locale"])
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

  await createIdTable(db, "university");
  await createNameTranslationTable(
    db,
    "university_translation",
    "university",
    "universityId",
    "university_translation_owner_locale_unique",
  );

  await db.schema
    .createTable("research_group")
    .ifNotExists()
    .addColumn("id", "integer", (c) => c.primaryKey().autoIncrement().notNull())
    .addColumn("address", "text")
    .addColumn("email", "text")
    .addColumn("phone", "text")
    .addColumn("name", "text")
    .addColumn("fullName", "text")
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
    .createTable("member_translation")
    .ifNotExists()
    .addColumn("id", "integer", (c) => c.primaryKey().autoIncrement().notNull())
    .addColumn("memberId", "integer", (c) => c.notNull().references("member.id").onDelete("cascade"))
    .addColumn("locale", "text", (c) => c.notNull().references("locale.code").onDelete("restrict"))
    .addColumn("bio", "text")
    .addUniqueConstraint("member_translation_owner_locale_unique", ["memberId", "locale"])
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
    .addColumn("groupId", "integer", (c) => c.notNull().references("research_group.id"))
    .addColumn("createdAt", "text")
    .addColumn("updatedAt", "text")
    .execute();

  await db.schema
    .createTable("research_line_translation")
    .ifNotExists()
    .addColumn("id", "integer", (c) => c.primaryKey().autoIncrement().notNull())
    .addColumn("researchLineId", "integer", (c) => c.notNull().references("research_line.id").onDelete("cascade"))
    .addColumn("locale", "text", (c) => c.notNull().references("locale.code").onDelete("restrict"))
    .addColumn("name", "text", (c) => c.notNull())
    .addColumn("description", "text")
    .addUniqueConstraint("research_line_translation_owner_locale_unique", ["researchLineId", "locale"])
    .execute();

  await db.schema
    .createTable("method")
    .ifNotExists()
    .addColumn("id", "integer", (c) => c.primaryKey().autoIncrement().notNull())
    .addColumn("groupId", "integer", (c) => c.notNull().references("research_group.id"))
    .addColumn("createdAt", "text")
    .addColumn("updatedAt", "text")
    .execute();

  await db.schema
    .createTable("method_translation")
    .ifNotExists()
    .addColumn("id", "integer", (c) => c.primaryKey().autoIncrement().notNull())
    .addColumn("methodId", "integer", (c) => c.notNull().references("method.id").onDelete("cascade"))
    .addColumn("locale", "text", (c) => c.notNull().references("locale.code").onDelete("restrict"))
    .addColumn("name", "text", (c) => c.notNull())
    .addColumn("description", "text")
    .addUniqueConstraint("method_translation_owner_locale_unique", ["methodId", "locale"])
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
    .addColumn("moreInfo", "text")
    .addColumn("groupId", "integer", (c) => c.notNull().references("research_group.id"))
    .addColumn("createdAt", "text")
    .addColumn("updatedAt", "text")
    .execute();

  await db.schema
    .createTable("software_translation")
    .ifNotExists()
    .addColumn("id", "integer", (c) => c.primaryKey().autoIncrement().notNull())
    .addColumn("softwareId", "integer", (c) => c.notNull().references("software.id").onDelete("cascade"))
    .addColumn("locale", "text", (c) => c.notNull().references("locale.code").onDelete("restrict"))
    .addColumn("name", "text")
    .addColumn("description", "text")
    .addUniqueConstraint("software_translation_owner_locale_unique", ["softwareId", "locale"])
    .execute();

  await db.schema
    .createTable("about")
    .ifNotExists()
    .addColumn("id", "integer", (c) => c.primaryKey().autoIncrement().notNull())
    .addColumn("createdAt", "text")
    .addColumn("updatedAt", "text")

    .addColumn("groupId", "integer", (c) => c.notNull().references("research_group.id"))
    .execute();

  await db.schema
    .createTable("about_translation")
    .ifNotExists()
    .addColumn("id", "integer", (c) => c.primaryKey().autoIncrement().notNull())
    .addColumn("aboutId", "integer", (c) => c.notNull().references("about.id").onDelete("cascade"))
    .addColumn("locale", "text", (c) => c.notNull().references("locale.code").onDelete("restrict"))
    .addColumn("description", "text", (c) => c.notNull())
    .addColumn("objectivesContent", "text", (c) => c.notNull())
    .addColumn("servicesContent", "text", (c) => c.notNull())
    .addColumn("homeServicesTeaserContent", "text", (c) => c.notNull())
    .addCheckConstraint("about_translation_objectives_json_valid", sql`json_valid("objectivesContent")`)
    .addCheckConstraint("about_translation_services_json_valid", sql`json_valid("servicesContent")`)
    .addCheckConstraint("about_translation_teaser_json_valid", sql`json_valid("homeServicesTeaserContent")`)
    .addUniqueConstraint("about_translation_owner_locale_unique", ["aboutId", "locale"])
    .execute();

  await db.schema
    .createTable("group_translation")
    .ifNotExists()
    .addColumn("id", "integer", (c) => c.primaryKey().autoIncrement().notNull())
    .addColumn("groupId", "integer", (c) => c.notNull().references("research_group.id").onDelete("cascade"))
    .addColumn("locale", "text", (c) => c.notNull().references("locale.code").onDelete("restrict"))
    .addColumn("summary", "text", (c) => c.notNull())
    .addColumn("facilities", "text")
    .addColumn("futureWork", "text")
    .addColumn("publicationsSection", "text")
    .addColumn("projectsSection", "text")
    .addUniqueConstraint("group_translation_owner_locale_unique", ["groupId", "locale"])
    .execute();

  await db.schema
    .createTable("news")
    .ifNotExists()
    .addColumn("id", "integer", (c) => c.primaryKey().autoIncrement().notNull())
    .addColumn("status", "integer", (c) => c.notNull())
    .addColumn("publishedAt", "text", (c) => c.notNull())
    .addColumn("updatedAt", "text")
    .addColumn("createdAt", "text")

    .addColumn("priority", "integer")
    .addColumn("authorId", "integer", (c) => c.notNull().references("member.id"))
    .addColumn("newsTypeId", "integer", (c) => c.notNull().references("news_type.id"))
    .execute();

  await db.schema
    .createTable("news_translation")
    .ifNotExists()
    .addColumn("id", "integer", (c) => c.primaryKey().autoIncrement().notNull())
    .addColumn("newsId", "integer", (c) => c.notNull().references("news.id").onDelete("cascade"))
    .addColumn("locale", "text", (c) => c.notNull().references("locale.code").onDelete("restrict"))
    .addColumn("title", "text", (c) => c.notNull())
    .addColumn("summary", "text", (c) => c.notNull())
    .addColumn("body", "text", (c) => c.notNull())
    .addUniqueConstraint("news_translation_owner_locale_unique", ["newsId", "locale"])
    .execute();

  await db.schema
    .createTable("publication")
    .ifNotExists()
    .addColumn("id", "integer", (c) => c.primaryKey().autoIncrement().notNull())
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
    .createTable("publication_translation")
    .ifNotExists()
    .addColumn("id", "integer", (c) => c.primaryKey().autoIncrement().notNull())
    .addColumn("publicationId", "integer", (c) => c.notNull().references("publication.id").onDelete("cascade"))
    .addColumn("locale", "text", (c) => c.notNull().references("locale.code").onDelete("restrict"))
    .addColumn("title", "text", (c) => c.notNull())
    .addColumn("abstract", "text")
    .addUniqueConstraint("publication_translation_owner_locale_unique", ["publicationId", "locale"])
    .execute();

  await db.schema
    .createTable("project")
    .ifNotExists()
    .addColumn("id", "integer", (c) => c.primaryKey().autoIncrement().notNull())
    .addColumn("code", "text", (c) => c.notNull())
    .addColumn("fundedAmount", "text", (c) => c.notNull())
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
    .createTable("project_translation")
    .ifNotExists()
    .addColumn("id", "integer", (c) => c.primaryKey().autoIncrement().notNull())
    .addColumn("projectId", "integer", (c) => c.notNull().references("project.id").onDelete("cascade"))
    .addColumn("locale", "text", (c) => c.notNull().references("locale.code").onDelete("restrict"))
    .addColumn("title", "text", (c) => c.notNull())
    .addColumn("description", "text", (c) => c.notNull())
    .addUniqueConstraint("project_translation_owner_locale_unique", ["projectId", "locale"])
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
    .createTable("asset_binding_history")
    .ifNotExists()
    .addColumn("id", "integer", (c) => c.primaryKey().autoIncrement().notNull())
    .addColumn("resourceType", "text", (c) => c.notNull())
    .addColumn("resourceId", "integer", (c) => c.notNull())
    .addColumn("slot", "text", (c) => c.notNull())
    .addColumn("assetId", "integer", (c) => c.notNull().references("asset.id"))
    .addColumn("version", "integer", (c) => c.notNull())
    .addColumn("actorId", "integer", (c) => c.references("member.id"))
    .addColumn("reason", "text")
    .addColumn("createdAt", "text", (c) => c.notNull())
    .addUniqueConstraint("asset_binding_history_owner_version_unique", [
      "resourceType",
      "resourceId",
      "slot",
      "version",
    ])
    .execute();

  await db.schema
    .createTable("asset_binding_current")
    .ifNotExists()
    .addColumn("resourceType", "text", (c) => c.notNull())
    .addColumn("resourceId", "integer", (c) => c.notNull())
    .addColumn("slot", "text", (c) => c.notNull())
    .addColumn("bindingId", "integer", (c) => c.notNull().references("asset_binding_history.id").onDelete("cascade"))
    .addColumn("updatedAt", "text", (c) => c.notNull())
    .addPrimaryKeyConstraint("asset_binding_current_pk", ["resourceType", "resourceId", "slot"])
    .execute();

  await db.schema
    .createTable("asset_audit")
    .ifNotExists()
    .addColumn("id", "integer", (c) => c.primaryKey().autoIncrement().notNull())
    .addColumn("assetId", "integer", (c) => c.references("asset.id"))
    .addColumn("bindingId", "integer", (c) => c.references("asset_binding_history.id"))
    .addColumn("action", "text", (c) => c.notNull())
    .addColumn("actorId", "integer", (c) => c.references("member.id"))
    .addColumn("reason", "text")
    .addColumn("createdAt", "text", (c) => c.notNull())
    .execute();

  await db.schema
    .createIndex("idx_asset_binding_current_unique")
    .ifNotExists()
    .on("asset_binding_current")
    .columns(["resourceType", "resourceId", "slot"])
    .execute();

  await db.schema
    .createIndex("idx_asset_binding_lookup")
    .ifNotExists()
    .on("asset_binding_current")
    .columns(["resourceType", "resourceId", "slot"])
    .execute();

  await db.schema
    .createIndex("idx_asset_binding_history_lookup")
    .ifNotExists()
    .on("asset_binding_history")
    .columns(["resourceType", "resourceId", "slot", "version"])
    .execute();

  await db.schema
    .createIndex("idx_news_status_published_at")
    .ifNotExists()
    .on("news")
    .columns(["status", "publishedAt"])
    .execute();

  await db.schema
    .createIndex("idx_news_type_published_at")
    .ifNotExists()
    .on("news")
    .columns(["newsTypeId", "publishedAt"])
    .execute();

  await db.schema.createIndex("idx_news_author").ifNotExists().on("news").column("authorId").execute();
}
