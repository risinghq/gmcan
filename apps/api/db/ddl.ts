import type { Kysely } from "kysely";
import { sql } from "kysely";

import { DEFAULT_LOCALE } from "../lib/locales.js";
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
    "bio",

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

  await db.schema
    .createTable("member_type")
    .ifNotExists()
    .addColumn("id", "integer", (c) => c.primaryKey().autoIncrement().notNull())
    .execute();
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

  await db.schema
    .createTable("news_type")
    .ifNotExists()
    .addColumn("id", "integer", (c) => c.primaryKey().autoIncrement().notNull())
    .execute();
  await db.schema
    .createTable("news_type_translation")
    .ifNotExists()
    .addColumn("id", "integer", (c) => c.primaryKey().autoIncrement().notNull())
    .addColumn("newsTypeId", "integer", (c) => c.notNull().references("news_type.id").onDelete("cascade"))
    .addColumn("locale", "text", (c) => c.notNull().references("locale.code").onDelete("restrict"))
    .addColumn("name", "text", (c) => c.notNull())
    .addUniqueConstraint("news_type_translation_owner_locale_unique", ["newsTypeId", "locale"])
    .execute();

  await db.schema
    .createTable("publication_type")
    .ifNotExists()
    .addColumn("id", "integer", (c) => c.primaryKey().autoIncrement().notNull())
    .execute();
  await db.schema
    .createTable("publication_type_translation")
    .ifNotExists()
    .addColumn("id", "integer", (c) => c.primaryKey().autoIncrement().notNull())
    .addColumn("publicationTypeId", "integer", (c) => c.notNull().references("publication_type.id").onDelete("cascade"))
    .addColumn("locale", "text", (c) => c.notNull().references("locale.code").onDelete("restrict"))
    .addColumn("name", "text", (c) => c.notNull())
    .addUniqueConstraint("publication_type_translation_owner_locale_unique", ["publicationTypeId", "locale"])
    .execute();

  await db.schema
    .createTable("thesis_type")
    .ifNotExists()
    .addColumn("id", "integer", (c) => c.primaryKey().autoIncrement().notNull())
    .execute();
  await db.schema
    .createTable("thesis_type_translation")
    .ifNotExists()
    .addColumn("id", "integer", (c) => c.primaryKey().autoIncrement().notNull())
    .addColumn("thesisTypeId", "integer", (c) => c.notNull().references("thesis_type.id").onDelete("cascade"))
    .addColumn("locale", "text", (c) => c.notNull().references("locale.code").onDelete("restrict"))
    .addColumn("name", "text", (c) => c.notNull())
    .addUniqueConstraint("thesis_type_translation_owner_locale_unique", ["thesisTypeId", "locale"])
    .execute();

  await db.schema
    .createTable("event")
    .ifNotExists()
    .addColumn("id", "integer", (c) => c.primaryKey().autoIncrement().notNull())
    .execute();
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

  await db.schema
    .createTable("university")
    .ifNotExists()
    .addColumn("id", "integer", (c) => c.primaryKey().autoIncrement().notNull())
    .execute();
  await db.schema
    .createTable("university_translation")
    .ifNotExists()
    .addColumn("id", "integer", (c) => c.primaryKey().autoIncrement().notNull())
    .addColumn("universityId", "integer", (c) => c.notNull().references("university.id").onDelete("cascade"))
    .addColumn("locale", "text", (c) => c.notNull().references("locale.code").onDelete("restrict"))
    .addColumn("name", "text", (c) => c.notNull())
    .addUniqueConstraint("university_translation_owner_locale_unique", ["universityId", "locale"])
    .execute();

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
    .addColumn("bio", "text")

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
      summary,
      authorName,
      categoryName
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
      INSERT INTO news_search(rowid, title, summary, authorName, categoryName)
      VALUES (
        NEW.id,
        COALESCE((SELECT title FROM news_translation WHERE newsId = NEW.id AND locale = ${DEFAULT_LOCALE}), ''),
        COALESCE((SELECT summary FROM news_translation WHERE newsId = NEW.id AND locale = ${DEFAULT_LOCALE}), ''),
        COALESCE((SELECT TRIM(COALESCE(firstName, '') || ' ' || COALESCE(lastName, '') || ' ' || COALESCE(maternalName, '')) FROM member WHERE id = NEW.authorId), ''),
        COALESCE((SELECT name FROM news_type_translation WHERE newsTypeId = NEW.newsTypeId AND locale = ${DEFAULT_LOCALE}), '')
      );
    END
  `.execute(db);

  await sql`
    CREATE TRIGGER IF NOT EXISTS news_au AFTER UPDATE ON news BEGIN
      INSERT OR REPLACE INTO news_search(rowid, title, summary, authorName, categoryName)
      VALUES (
        NEW.id,
        COALESCE((SELECT title FROM news_translation WHERE newsId = NEW.id AND locale = ${DEFAULT_LOCALE}), ''),
        COALESCE((SELECT summary FROM news_translation WHERE newsId = NEW.id AND locale = ${DEFAULT_LOCALE}), ''),
        COALESCE((SELECT TRIM(COALESCE(firstName, '') || ' ' || COALESCE(lastName, '') || ' ' || COALESCE(maternalName, '')) FROM member WHERE id = NEW.authorId), ''),
        COALESCE((SELECT name FROM news_type_translation WHERE newsTypeId = NEW.newsTypeId AND locale = ${DEFAULT_LOCALE}), '')
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
      SET categoryName = COALESCE((SELECT name FROM news_type_translation WHERE newsTypeId = NEW.id AND locale = ${DEFAULT_LOCALE}), '')
      WHERE rowid IN (SELECT id FROM news WHERE newsTypeId = NEW.id);
    END
  `.execute(db);

  await sql`
    CREATE TRIGGER IF NOT EXISTS news_translation_ai AFTER INSERT ON news_translation BEGIN
      INSERT OR REPLACE INTO news_search(rowid, title, summary, authorName, categoryName)
      VALUES (
        NEW.newsId,
        COALESCE((SELECT title FROM news_translation WHERE newsId = NEW.newsId AND locale = ${DEFAULT_LOCALE}), ''),
        COALESCE((SELECT summary FROM news_translation WHERE newsId = NEW.newsId AND locale = ${DEFAULT_LOCALE}), ''),
        COALESCE((SELECT TRIM(COALESCE(member.firstName, '') || ' ' || COALESCE(member.lastName, '') || ' ' || COALESCE(member.maternalName, '')) FROM news LEFT JOIN member ON member.id = news.authorId WHERE news.id = NEW.newsId), ''),
        COALESCE((SELECT news_type_translation.name FROM news LEFT JOIN news_type_translation ON news_type_translation.newsTypeId = news.newsTypeId AND news_type_translation.locale = ${DEFAULT_LOCALE} WHERE news.id = NEW.newsId), '')
      );
    END
  `.execute(db);

  await sql`
    INSERT OR REPLACE INTO news_search(rowid, title, summary, authorName, categoryName)
    SELECT
      news.id,
      COALESCE(news_translation.title, ''),
      COALESCE(news_translation.summary, ''),
      COALESCE(TRIM(COALESCE(member.firstName, '') || ' ' || COALESCE(member.lastName, '') || ' ' || COALESCE(member.maternalName, '')), ''),
      COALESCE(news_type_translation.name, '')
    FROM news
    LEFT JOIN news_translation ON news_translation.newsId = news.id AND news_translation.locale = ${DEFAULT_LOCALE}
    LEFT JOIN member ON member.id = news.authorId
    LEFT JOIN news_type_translation ON news_type_translation.newsTypeId = news.newsTypeId AND news_type_translation.locale = ${DEFAULT_LOCALE}
  `.execute(db);
}
