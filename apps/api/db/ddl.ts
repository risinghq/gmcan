import type { Kysely } from "kysely";
import { sql } from "kysely";

import type { Database } from "./schema.js";

export const EXPECTED_COLUMNS: Record<string, readonly string[]> = {
  locale: ["code"],
  gender: ["code", "name"],
  prefix: ["code", "label"],
  role: ["code", "name"],
  member_type: ["code"],
  member_type_translation: ["memberTypeCode", "locale", "name", "nameSingular"],
  publication_kind: ["code"],
  publication_kind_translation: ["publicationKindCode", "locale", "name"],
  thesis_kind: ["code"],
  thesis_kind_translation: ["thesisKindCode", "locale", "name"],
  news_kind: ["code"],
  news_kind_translation: ["newsKindCode", "locale", "name"],
  currency: ["code", "symbol"],
  funding_source: ["code", "name"],
  journal: ["id", "name"],
  university: ["id"],
  university_translation: ["universityId", "locale", "name"],
  event: ["id"],
  event_translation: ["eventId", "locale", "name", "city", "country"],
  research_group: ["id", "slug", "shortName", "fullName", "address", "email", "phone", "createdAt", "updatedAt"],
  research_group_translation: [
    "groupId",
    "locale",
    "summary",
    "facilities",
    "futureWork",
    "publicationsSection",
    "projectsSection",
  ],
  member: [
    "id",
    "dni",
    "email",
    "passwordHash",
    "firstName",
    "lastName",
    "maternalName",
    "birthDate",
    "isActive",
    "passwordResetRequired",
    "roleCode",
    "memberTypeCode",
    "prefixCode",
    "genderCode",
    "resetToken",
    "resetExpiresAt",
    "createdAt",
    "updatedAt",
  ],
  member_translation: ["memberId", "locale", "bio"],
  session: ["id", "memberId", "expiresAt", "lastActiveAt"],
  research_line: ["id", "groupId", "createdAt", "updatedAt"],
  research_line_translation: ["researchLineId", "locale", "name", "description"],
  method: ["id", "groupId", "createdAt", "updatedAt"],
  method_translation: ["methodId", "locale", "name", "description"],
  equipment: ["id", "groupId", "name", "cpu", "gpu", "ram", "storage", "createdAt", "updatedAt"],
  software: ["id", "groupId", "moreInfo", "createdAt", "updatedAt"],
  software_translation: ["softwareId", "locale", "name", "description"],
  about: ["id", "groupId", "createdAt", "updatedAt"],
  about_translation: [
    "aboutId",
    "locale",
    "description",
    "objectivesContent",
    "servicesContent",
    "homeServicesTeaserContent",
  ],
  news: ["id", "statusCode", "publishedAt", "priority", "authorId", "newsKindCode", "createdAt", "updatedAt"],
  news_translation: ["newsId", "locale", "title", "summary", "body"],
  news_fts: ["title", "summary", "authorName", "kindName", "newsId", "locale"],
  publication: ["id", "kindCode", "doi", "publishedAt", "createdAt", "updatedAt"],
  publication_translation: ["publicationId", "locale", "title", "abstract"],
  journal_article: ["publicationId", "journalId", "issue"],
  conference_paper: ["publicationId", "eventId"],
  thesis: ["publicationId", "universityId", "thesisKindCode"],
  publication_author: ["publicationId", "authorOrder", "memberId", "externalName"],
  project: [
    "id",
    "code",
    "fundedAmountMinor",
    "statusCode",
    "startDate",
    "endDate",
    "researchLineId",
    "currencyCode",
    "fundingSourceCode",
    "createdAt",
    "updatedAt",
  ],
  project_translation: ["projectId", "locale", "title", "description"],
  project_member: ["projectId", "memberId", "createdAt", "updatedAt"],
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
    "lifecycleStatus",
    "createdBy",
    "createdAt",
    "deletedAt",
  ],
  asset_audit: ["id", "assetId", "action", "actorId", "reason", "createdAt"],
  member_asset: ["memberId", "slot", "version", "assetId", "actorId", "reason", "createdAt"],
  news_asset: ["newsId", "slot", "version", "assetId", "actorId", "reason", "createdAt"],
  method_asset: ["methodId", "slot", "version", "assetId", "actorId", "reason", "createdAt"],
  research_line_asset: ["researchLineId", "slot", "version", "assetId", "actorId", "reason", "createdAt"],
  publication_asset: ["publicationId", "slot", "version", "assetId", "actorId", "reason", "createdAt"],
  research_group_asset: ["groupId", "slot", "version", "assetId", "actorId", "reason", "createdAt"],
  about_asset: ["aboutId", "slot", "version", "assetId", "actorId", "reason", "createdAt"],
};

function addCodeLocaleTranslation(
  db: Kysely<Database>,
  table: string,
  ownerTable: string,
  ownerColumn: string,
  extraColumns: Array<{ name: string; type: "text"; notNull?: boolean }> = [],
) {
  let builder = db.schema
    .createTable(table)
    .ifNotExists()
    .addColumn(ownerColumn, "text", (c) => c.notNull().references(`${ownerTable}.code`).onDelete("cascade"))
    .addColumn("locale", "text", (c) => c.notNull().references("locale.code").onDelete("restrict"))
    .addColumn("name", "text", (c) => c.notNull());

  for (const col of extraColumns) {
    builder = builder.addColumn(col.name, col.type, (c) => (col.notNull ? c.notNull() : c));
  }

  return builder.addPrimaryKeyConstraint(`${table}_pk`, [ownerColumn, "locale"]).execute();
}

function addEntityLocaleTranslation(
  db: Kysely<Database>,
  table: string,
  ownerTable: string,
  ownerColumn: string,
  columns: Array<{ name: string; type: "text" | "integer"; notNull?: boolean }>,
) {
  let builder = db.schema
    .createTable(table)
    .ifNotExists()
    .addColumn(ownerColumn, "integer", (c) => c.notNull().references(`${ownerTable}.id`).onDelete("cascade"))
    .addColumn("locale", "text", (c) => c.notNull().references("locale.code").onDelete("restrict"));

  for (const col of columns) {
    builder = builder.addColumn(col.name, col.type, (c) => (col.notNull ? c.notNull() : c));
  }

  return builder.addPrimaryKeyConstraint(`${table}_pk`, [ownerColumn, "locale"]).execute();
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
    .addColumn("code", "text", (c) => c.primaryKey().notNull())
    .addColumn("name", "text", (c) => c.notNull())
    .addCheckConstraint("gender_code_check", sql`code in ('male','female')`)
    .execute();

  await db.schema
    .createTable("prefix")
    .ifNotExists()
    .addColumn("code", "text", (c) => c.primaryKey().notNull())
    .addColumn("label", "text", (c) => c.notNull())
    .addCheckConstraint("prefix_code_check", sql`code in ('dr','dra','mg','lic','bach','ing','none')`)
    .execute();

  await db.schema
    .createTable("role")
    .ifNotExists()
    .addColumn("code", "text", (c) => c.primaryKey().notNull())
    .addColumn("name", "text", (c) => c.notNull())
    .addCheckConstraint("role_code_check", sql`code in ('administrator','researcher','visitor')`)
    .execute();

  await db.schema
    .createTable("member_type")
    .ifNotExists()
    .addColumn("code", "text", (c) => c.primaryKey().notNull())
    .addCheckConstraint(
      "member_type_code_check",
      sql`code in ('researcher','phd_student','master_student','undergraduate_student','collaborator')`,
    )
    .execute();

  await addCodeLocaleTranslation(db, "member_type_translation", "member_type", "memberTypeCode", [
    { name: "nameSingular", type: "text", notNull: true },
  ]);

  await db.schema
    .createTable("publication_kind")
    .ifNotExists()
    .addColumn("code", "text", (c) => c.primaryKey().notNull())
    .addCheckConstraint("publication_kind_code_check", sql`code in ('journal_article','conference_paper','thesis')`)
    .execute();
  await addCodeLocaleTranslation(db, "publication_kind_translation", "publication_kind", "publicationKindCode");

  await db.schema
    .createTable("thesis_kind")
    .ifNotExists()
    .addColumn("code", "text", (c) => c.primaryKey().notNull())
    .addCheckConstraint("thesis_kind_code_check", sql`code in ('phd','masters')`)
    .execute();
  await addCodeLocaleTranslation(db, "thesis_kind_translation", "thesis_kind", "thesisKindCode");

  await db.schema
    .createTable("news_kind")
    .ifNotExists()
    .addColumn("code", "text", (c) => c.primaryKey().notNull())
    .addCheckConstraint("news_kind_code_check", sql`code in ('general','research','event')`)
    .execute();
  await addCodeLocaleTranslation(db, "news_kind_translation", "news_kind", "newsKindCode");

  await db.schema
    .createTable("currency")
    .ifNotExists()
    .addColumn("code", "text", (c) => c.primaryKey().notNull())
    .addColumn("symbol", "text", (c) => c.notNull())
    .addCheckConstraint("currency_code_check", sql`code in ('pen','usd')`)
    .execute();

  await db.schema
    .createTable("funding_source")
    .ifNotExists()
    .addColumn("code", "text", (c) => c.primaryKey().notNull())
    .addColumn("name", "text", (c) => c.notNull())
    .addCheckConstraint("funding_source_code_check", sql`code in ('vrip','none')`)
    .execute();

  await db.schema
    .createTable("journal")
    .ifNotExists()
    .addColumn("id", "integer", (c) => c.primaryKey().autoIncrement().notNull())
    .addColumn("name", "text", (c) => c.notNull().unique())
    .execute();

  await db.schema
    .createTable("university")
    .ifNotExists()
    .addColumn("id", "integer", (c) => c.primaryKey().autoIncrement().notNull())
    .execute();
  await addEntityLocaleTranslation(db, "university_translation", "university", "universityId", [
    { name: "name", type: "text", notNull: true },
  ]);

  await db.schema
    .createTable("event")
    .ifNotExists()
    .addColumn("id", "integer", (c) => c.primaryKey().autoIncrement().notNull())
    .execute();
  await addEntityLocaleTranslation(db, "event_translation", "event", "eventId", [
    { name: "name", type: "text", notNull: true },
    { name: "city", type: "text" },
    { name: "country", type: "text" },
  ]);

  await db.schema
    .createTable("research_group")
    .ifNotExists()
    .addColumn("id", "integer", (c) => c.primaryKey().autoIncrement().notNull())
    .addColumn("slug", "text", (c) => c.notNull().unique())
    .addColumn("shortName", "text", (c) => c.notNull())
    .addColumn("fullName", "text", (c) => c.notNull())
    .addColumn("address", "text")
    .addColumn("email", "text")
    .addColumn("phone", "text")
    .addColumn("createdAt", "text", (c) => c.notNull())
    .addColumn("updatedAt", "text", (c) => c.notNull())
    .execute();

  await addEntityLocaleTranslation(db, "research_group_translation", "research_group", "groupId", [
    { name: "summary", type: "text", notNull: true },
    { name: "facilities", type: "text" },
    { name: "futureWork", type: "text" },
    { name: "publicationsSection", type: "text" },
    { name: "projectsSection", type: "text" },
  ]);

  await db.schema
    .createTable("member")
    .ifNotExists()
    .addColumn("id", "integer", (c) => c.primaryKey().autoIncrement().notNull())
    .addColumn("dni", "text", (c) => c.notNull().unique())
    .addColumn("email", "text", (c) => c.notNull().unique())
    .addColumn("passwordHash", "text", (c) => c.notNull())
    .addColumn("firstName", "text", (c) => c.notNull())
    .addColumn("lastName", "text", (c) => c.notNull())
    .addColumn("maternalName", "text")
    .addColumn("birthDate", "text")
    .addColumn("isActive", "integer", (c) => c.notNull())
    .addColumn("passwordResetRequired", "integer", (c) => c.notNull())
    .addColumn("roleCode", "text", (c) => c.notNull().references("role.code"))
    .addColumn("memberTypeCode", "text", (c) => c.notNull().references("member_type.code"))
    .addColumn("prefixCode", "text", (c) => c.references("prefix.code"))
    .addColumn("genderCode", "text", (c) => c.references("gender.code"))
    .addColumn("resetToken", "text")
    .addColumn("resetExpiresAt", "text")
    .addColumn("createdAt", "text", (c) => c.notNull())
    .addColumn("updatedAt", "text", (c) => c.notNull())
    .addCheckConstraint("member_is_active_check", sql`isActive in (0,1)`)
    .addCheckConstraint("member_password_reset_required_check", sql`passwordResetRequired in (0,1)`)
    .execute();

  await addEntityLocaleTranslation(db, "member_translation", "member", "memberId", [{ name: "bio", type: "text" }]);

  await db.schema
    .createTable("session")
    .ifNotExists()
    .addColumn("id", "text", (c) => c.primaryKey().notNull())
    .addColumn("memberId", "integer", (c) => c.notNull().references("member.id").onDelete("cascade"))
    .addColumn("expiresAt", "text", (c) => c.notNull())
    .addColumn("lastActiveAt", "text", (c) => c.notNull())
    .execute();

  await db.schema
    .createTable("research_line")
    .ifNotExists()
    .addColumn("id", "integer", (c) => c.primaryKey().autoIncrement().notNull())
    .addColumn("groupId", "integer", (c) => c.notNull().references("research_group.id").onDelete("cascade"))
    .addColumn("createdAt", "text", (c) => c.notNull())
    .addColumn("updatedAt", "text", (c) => c.notNull())
    .execute();
  await addEntityLocaleTranslation(db, "research_line_translation", "research_line", "researchLineId", [
    { name: "name", type: "text", notNull: true },
    { name: "description", type: "text" },
  ]);

  await db.schema
    .createTable("method")
    .ifNotExists()
    .addColumn("id", "integer", (c) => c.primaryKey().autoIncrement().notNull())
    .addColumn("groupId", "integer", (c) => c.notNull().references("research_group.id").onDelete("cascade"))
    .addColumn("createdAt", "text", (c) => c.notNull())
    .addColumn("updatedAt", "text", (c) => c.notNull())
    .execute();
  await addEntityLocaleTranslation(db, "method_translation", "method", "methodId", [
    { name: "name", type: "text", notNull: true },
    { name: "description", type: "text" },
  ]);

  await db.schema
    .createTable("equipment")
    .ifNotExists()
    .addColumn("id", "integer", (c) => c.primaryKey().autoIncrement().notNull())
    .addColumn("groupId", "integer", (c) => c.notNull().references("research_group.id").onDelete("cascade"))
    .addColumn("name", "text", (c) => c.notNull())
    .addColumn("cpu", "text")
    .addColumn("gpu", "text")
    .addColumn("ram", "text")
    .addColumn("storage", "text")
    .addColumn("createdAt", "text", (c) => c.notNull())
    .addColumn("updatedAt", "text", (c) => c.notNull())
    .execute();

  await db.schema
    .createTable("software")
    .ifNotExists()
    .addColumn("id", "integer", (c) => c.primaryKey().autoIncrement().notNull())
    .addColumn("groupId", "integer", (c) => c.notNull().references("research_group.id").onDelete("cascade"))
    .addColumn("moreInfo", "text")
    .addColumn("createdAt", "text", (c) => c.notNull())
    .addColumn("updatedAt", "text", (c) => c.notNull())
    .execute();
  await addEntityLocaleTranslation(db, "software_translation", "software", "softwareId", [
    { name: "name", type: "text", notNull: true },
    { name: "description", type: "text" },
  ]);

  await db.schema
    .createTable("about")
    .ifNotExists()
    .addColumn("id", "integer", (c) => c.primaryKey().autoIncrement().notNull())
    .addColumn("groupId", "integer", (c) => c.notNull().references("research_group.id").onDelete("cascade"))
    .addColumn("createdAt", "text", (c) => c.notNull())
    .addColumn("updatedAt", "text", (c) => c.notNull())
    .execute();

  await db.schema
    .createTable("about_translation")
    .ifNotExists()
    .addColumn("aboutId", "integer", (c) => c.notNull().references("about.id").onDelete("cascade"))
    .addColumn("locale", "text", (c) => c.notNull().references("locale.code").onDelete("restrict"))
    .addColumn("description", "text", (c) => c.notNull())
    .addColumn("objectivesContent", "text", (c) => c.notNull())
    .addColumn("servicesContent", "text", (c) => c.notNull())
    .addColumn("homeServicesTeaserContent", "text", (c) => c.notNull())
    .addCheckConstraint("about_translation_objectives_json_valid", sql`json_valid(objectivesContent)`)
    .addCheckConstraint("about_translation_services_json_valid", sql`json_valid(servicesContent)`)
    .addCheckConstraint("about_translation_teaser_json_valid", sql`json_valid(homeServicesTeaserContent)`)
    .addPrimaryKeyConstraint("about_translation_pk", ["aboutId", "locale"])
    .execute();

  await db.schema
    .createTable("news")
    .ifNotExists()
    .addColumn("id", "integer", (c) => c.primaryKey().autoIncrement().notNull())
    .addColumn("statusCode", "text", (c) => c.notNull())
    .addColumn("publishedAt", "text", (c) => c.notNull())
    .addColumn("priority", "integer")
    .addColumn("authorId", "integer", (c) => c.notNull().references("member.id").onDelete("restrict"))
    .addColumn("newsKindCode", "text", (c) => c.notNull().references("news_kind.code"))
    .addColumn("createdAt", "text", (c) => c.notNull())
    .addColumn("updatedAt", "text", (c) => c.notNull())
    .addCheckConstraint("news_status_code_check", sql`statusCode in ('draft','published','archived')`)
    .execute();

  await addEntityLocaleTranslation(db, "news_translation", "news", "newsId", [
    { name: "title", type: "text", notNull: true },
    { name: "summary", type: "text", notNull: true },
    { name: "body", type: "text", notNull: true },
  ]);

  await db.schema
    .createTable("publication")
    .ifNotExists()
    .addColumn("id", "integer", (c) => c.primaryKey().autoIncrement().notNull())
    .addColumn("kindCode", "text", (c) => c.notNull().references("publication_kind.code"))
    .addColumn("doi", "text")
    .addColumn("publishedAt", "text", (c) => c.notNull())
    .addColumn("createdAt", "text", (c) => c.notNull())
    .addColumn("updatedAt", "text", (c) => c.notNull())
    .execute();

  await addEntityLocaleTranslation(db, "publication_translation", "publication", "publicationId", [
    { name: "title", type: "text", notNull: true },
    { name: "abstract", type: "text" },
  ]);

  await db.schema
    .createTable("journal_article")
    .ifNotExists()
    .addColumn("publicationId", "integer", (c) =>
      c.notNull().primaryKey().references("publication.id").onDelete("cascade"),
    )
    .addColumn("journalId", "integer", (c) => c.references("journal.id").onDelete("restrict"))
    .addColumn("issue", "integer")
    .execute();

  await db.schema
    .createTable("conference_paper")
    .ifNotExists()
    .addColumn("publicationId", "integer", (c) =>
      c.notNull().primaryKey().references("publication.id").onDelete("cascade"),
    )
    .addColumn("eventId", "integer", (c) => c.notNull().references("event.id").onDelete("restrict"))
    .execute();

  await db.schema
    .createTable("thesis")
    .ifNotExists()
    .addColumn("publicationId", "integer", (c) =>
      c.notNull().primaryKey().references("publication.id").onDelete("cascade"),
    )
    .addColumn("universityId", "integer", (c) => c.notNull().references("university.id").onDelete("restrict"))
    .addColumn("thesisKindCode", "text", (c) => c.notNull().references("thesis_kind.code"))
    .execute();

  await db.schema
    .createTable("publication_author")
    .ifNotExists()
    .addColumn("publicationId", "integer", (c) => c.notNull().references("publication.id").onDelete("cascade"))
    .addColumn("authorOrder", "integer", (c) => c.notNull())
    .addColumn("memberId", "integer", (c) => c.references("member.id").onDelete("set null"))
    .addColumn("externalName", "text")
    .addPrimaryKeyConstraint("publication_author_pk", ["publicationId", "authorOrder"])
    .addCheckConstraint("publication_author_order_check", sql`authorOrder > 0`)
    .addCheckConstraint(
      "publication_author_identity_check",
      sql`((memberId is not null and externalName is null) or (memberId is null and externalName is not null and length(trim(externalName)) > 0))`,
    )
    .execute();

  await db.schema
    .createTable("project")
    .ifNotExists()
    .addColumn("id", "integer", (c) => c.primaryKey().autoIncrement().notNull())
    .addColumn("code", "text", (c) => c.notNull().unique())
    .addColumn("fundedAmountMinor", "integer", (c) => c.notNull().defaultTo(0))
    .addColumn("statusCode", "text", (c) => c.notNull())
    .addColumn("startDate", "text", (c) => c.notNull())
    .addColumn("endDate", "text")
    .addColumn("researchLineId", "integer", (c) => c.notNull().references("research_line.id").onDelete("restrict"))
    .addColumn("currencyCode", "text", (c) => c.notNull().references("currency.code"))
    .addColumn("fundingSourceCode", "text", (c) => c.notNull().references("funding_source.code"))
    .addColumn("createdAt", "text", (c) => c.notNull())
    .addColumn("updatedAt", "text", (c) => c.notNull())
    .addCheckConstraint("project_funded_amount_minor_check", sql`fundedAmountMinor >= 0`)
    .addCheckConstraint("project_status_code_check", sql`statusCode in ('planned','active','completed','archived')`)
    .execute();

  await addEntityLocaleTranslation(db, "project_translation", "project", "projectId", [
    { name: "title", type: "text", notNull: true },
    { name: "description", type: "text", notNull: true },
  ]);

  await db.schema
    .createTable("project_member")
    .ifNotExists()
    .addColumn("projectId", "integer", (c) => c.notNull().references("project.id").onDelete("cascade"))
    .addColumn("memberId", "integer", (c) => c.notNull().references("member.id").onDelete("cascade"))
    .addColumn("createdAt", "text", (c) => c.notNull())
    .addColumn("updatedAt", "text", (c) => c.notNull())
    .addPrimaryKeyConstraint("project_member_pk", ["projectId", "memberId"])
    .execute();

  await db.schema
    .createTable("member_group")
    .ifNotExists()
    .addColumn("memberId", "integer", (c) => c.notNull().references("member.id").onDelete("cascade"))
    .addColumn("groupId", "integer", (c) => c.notNull().references("research_group.id").onDelete("cascade"))
    .addColumn("createdAt", "text", (c) => c.notNull())
    .addColumn("updatedAt", "text", (c) => c.notNull())
    .addPrimaryKeyConstraint("member_group_pk", ["memberId", "groupId"])
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
    .addColumn("lifecycleStatus", "text", (c) => c.notNull())
    .addColumn("createdBy", "integer", (c) => c.references("member.id").onDelete("set null"))
    .addColumn("createdAt", "text", (c) => c.notNull())
    .addColumn("deletedAt", "text")
    .addCheckConstraint("asset_size_bytes_check", sql`sizeBytes >= 0`)
    .addCheckConstraint("asset_visibility_check", sql`visibility in ('public','private')`)
    .addCheckConstraint("asset_lifecycle_status_check", sql`lifecycleStatus in ('active','soft_deleted')`)
    .execute();

  await db.schema
    .createTable("asset_audit")
    .ifNotExists()
    .addColumn("id", "integer", (c) => c.primaryKey().autoIncrement().notNull())
    .addColumn("assetId", "integer", (c) => c.references("asset.id").onDelete("set null"))
    .addColumn("action", "text", (c) => c.notNull())
    .addColumn("actorId", "integer", (c) => c.references("member.id").onDelete("set null"))
    .addColumn("reason", "text")
    .addColumn("createdAt", "text", (c) => c.notNull())
    .execute();

  await db.schema
    .createTable("member_asset")
    .ifNotExists()
    .addColumn("memberId", "integer", (c) => c.notNull().references("member.id").onDelete("cascade"))
    .addColumn("slot", "text", (c) => c.notNull())
    .addColumn("version", "integer", (c) => c.notNull())
    .addColumn("assetId", "integer", (c) => c.notNull().references("asset.id").onDelete("restrict"))
    .addColumn("actorId", "integer", (c) => c.references("member.id").onDelete("set null"))
    .addColumn("reason", "text")
    .addColumn("createdAt", "text", (c) => c.notNull())
    .addPrimaryKeyConstraint("member_asset_pk", ["memberId", "slot", "version"])
    .addCheckConstraint("member_asset_slot_check", sql`slot = 'photo'`)
    .addCheckConstraint("member_asset_version_check", sql`version > 0`)
    .execute();

  await db.schema
    .createTable("news_asset")
    .ifNotExists()
    .addColumn("newsId", "integer", (c) => c.notNull().references("news.id").onDelete("cascade"))
    .addColumn("slot", "text", (c) => c.notNull())
    .addColumn("version", "integer", (c) => c.notNull())
    .addColumn("assetId", "integer", (c) => c.notNull().references("asset.id").onDelete("restrict"))
    .addColumn("actorId", "integer", (c) => c.references("member.id").onDelete("set null"))
    .addColumn("reason", "text")
    .addColumn("createdAt", "text", (c) => c.notNull())
    .addPrimaryKeyConstraint("news_asset_pk", ["newsId", "slot", "version"])
    .addCheckConstraint("news_asset_slot_check", sql`slot = 'photo'`)
    .addCheckConstraint("news_asset_version_check", sql`version > 0`)
    .execute();

  await db.schema
    .createTable("method_asset")
    .ifNotExists()
    .addColumn("methodId", "integer", (c) => c.notNull().references("method.id").onDelete("cascade"))
    .addColumn("slot", "text", (c) => c.notNull())
    .addColumn("version", "integer", (c) => c.notNull())
    .addColumn("assetId", "integer", (c) => c.notNull().references("asset.id").onDelete("restrict"))
    .addColumn("actorId", "integer", (c) => c.references("member.id").onDelete("set null"))
    .addColumn("reason", "text")
    .addColumn("createdAt", "text", (c) => c.notNull())
    .addPrimaryKeyConstraint("method_asset_pk", ["methodId", "slot", "version"])
    .addCheckConstraint("method_asset_slot_check", sql`slot = 'photo'`)
    .addCheckConstraint("method_asset_version_check", sql`version > 0`)
    .execute();

  await db.schema
    .createTable("research_line_asset")
    .ifNotExists()
    .addColumn("researchLineId", "integer", (c) => c.notNull().references("research_line.id").onDelete("cascade"))
    .addColumn("slot", "text", (c) => c.notNull())
    .addColumn("version", "integer", (c) => c.notNull())
    .addColumn("assetId", "integer", (c) => c.notNull().references("asset.id").onDelete("restrict"))
    .addColumn("actorId", "integer", (c) => c.references("member.id").onDelete("set null"))
    .addColumn("reason", "text")
    .addColumn("createdAt", "text", (c) => c.notNull())
    .addPrimaryKeyConstraint("research_line_asset_pk", ["researchLineId", "slot", "version"])
    .addCheckConstraint("research_line_asset_slot_check", sql`slot = 'photo'`)
    .addCheckConstraint("research_line_asset_version_check", sql`version > 0`)
    .execute();

  await db.schema
    .createTable("publication_asset")
    .ifNotExists()
    .addColumn("publicationId", "integer", (c) => c.notNull().references("publication.id").onDelete("cascade"))
    .addColumn("slot", "text", (c) => c.notNull())
    .addColumn("version", "integer", (c) => c.notNull())
    .addColumn("assetId", "integer", (c) => c.notNull().references("asset.id").onDelete("restrict"))
    .addColumn("actorId", "integer", (c) => c.references("member.id").onDelete("set null"))
    .addColumn("reason", "text")
    .addColumn("createdAt", "text", (c) => c.notNull())
    .addPrimaryKeyConstraint("publication_asset_pk", ["publicationId", "slot", "version"])
    .addCheckConstraint("publication_asset_slot_check", sql`slot = 'file'`)
    .addCheckConstraint("publication_asset_version_check", sql`version > 0`)
    .execute();

  await db.schema
    .createTable("research_group_asset")
    .ifNotExists()
    .addColumn("groupId", "integer", (c) => c.notNull().references("research_group.id").onDelete("cascade"))
    .addColumn("slot", "text", (c) => c.notNull())
    .addColumn("version", "integer", (c) => c.notNull())
    .addColumn("assetId", "integer", (c) => c.notNull().references("asset.id").onDelete("restrict"))
    .addColumn("actorId", "integer", (c) => c.references("member.id").onDelete("set null"))
    .addColumn("reason", "text")
    .addColumn("createdAt", "text", (c) => c.notNull())
    .addPrimaryKeyConstraint("research_group_asset_pk", ["groupId", "slot", "version"])
    .addCheckConstraint("research_group_asset_slot_check", sql`slot in ('facilities','header','footer')`)
    .addCheckConstraint("research_group_asset_version_check", sql`version > 0`)
    .execute();

  await db.schema
    .createTable("about_asset")
    .ifNotExists()
    .addColumn("aboutId", "integer", (c) => c.notNull().references("about.id").onDelete("cascade"))
    .addColumn("slot", "text", (c) => c.notNull())
    .addColumn("version", "integer", (c) => c.notNull())
    .addColumn("assetId", "integer", (c) => c.notNull().references("asset.id").onDelete("restrict"))
    .addColumn("actorId", "integer", (c) => c.references("member.id").onDelete("set null"))
    .addColumn("reason", "text")
    .addColumn("createdAt", "text", (c) => c.notNull())
    .addPrimaryKeyConstraint("about_asset_pk", ["aboutId", "slot", "version"])
    .addCheckConstraint("about_asset_slot_check", sql`slot = 'photo'`)
    .addCheckConstraint("about_asset_version_check", sql`version > 0`)
    .execute();

  await db.schema
    .createIndex("idx_member_active_type")
    .ifNotExists()
    .on("member")
    .columns(["isActive", "memberTypeCode"])
    .execute();
  await db.schema
    .createIndex("idx_news_status_published")
    .ifNotExists()
    .on("news")
    .columns(["statusCode", "publishedAt"])
    .execute();
  await db.schema
    .createIndex("idx_news_kind_published")
    .ifNotExists()
    .on("news")
    .columns(["newsKindCode", "publishedAt"])
    .execute();
  await db.schema
    .createIndex("idx_project_status_start")
    .ifNotExists()
    .on("project")
    .columns(["statusCode", "startDate"])
    .execute();
  await db.schema
    .createIndex("idx_publication_kind_published")
    .ifNotExists()
    .on("publication")
    .columns(["kindCode", "publishedAt"])
    .execute();
  await db.schema
    .createIndex("idx_publication_author_member")
    .ifNotExists()
    .on("publication_author")
    .column("memberId")
    .execute();

  await ensureNewsSearchIndex(db);
}

// Append a WHERE on t (news_translation) and n (news) to choose which rows to index.
const insertNewsFtsRows = sql`
  INSERT INTO news_fts (title, summary, authorName, kindName, newsId, locale)
  SELECT
    t.title,
    t.summary,
    m.firstName || ' ' || m.lastName || ' ' || COALESCE(m.maternalName, ''),
    k.name,
    t.newsId,
    t.locale
  FROM news_translation t
  JOIN news n ON n.id = t.newsId
  LEFT JOIN member m ON m.id = n.authorId
  LEFT JOIN news_kind_translation k ON k.newsKindCode = n.newsKindCode AND k.locale = t.locale
`;

/** Creates news_fts and its triggers if missing, backfilling the index when the table is new. Idempotent. */
export async function ensureNewsSearchIndex(db: Kysely<Database>) {
  await db.transaction().execute(async (trx) => {
    const existing = await sql`SELECT 1 FROM sqlite_master WHERE type = 'table' AND name = 'news_fts'`.execute(trx);

    await sql`
      CREATE VIRTUAL TABLE IF NOT EXISTS news_fts USING fts5(
        title,
        summary,
        authorName,
        kindName,
        newsId UNINDEXED,
        locale UNINDEXED,
        tokenize = 'unicode61 remove_diacritics 2'
      )
    `.execute(trx);

    await sql`
      CREATE TRIGGER IF NOT EXISTS news_translation_fts_ai AFTER INSERT ON news_translation BEGIN
        ${insertNewsFtsRows} WHERE t.newsId = NEW.newsId AND t.locale = NEW.locale;
      END
    `.execute(trx);

    await sql`
      CREATE TRIGGER IF NOT EXISTS news_translation_fts_au
      AFTER UPDATE OF newsId, locale, title, summary ON news_translation BEGIN
        DELETE FROM news_fts WHERE newsId = OLD.newsId AND locale = OLD.locale;
        ${insertNewsFtsRows} WHERE t.newsId = NEW.newsId AND t.locale = NEW.locale;
      END
    `.execute(trx);

    await sql`
      CREATE TRIGGER IF NOT EXISTS news_translation_fts_ad AFTER DELETE ON news_translation BEGIN
        DELETE FROM news_fts WHERE newsId = OLD.newsId AND locale = OLD.locale;
      END
    `.execute(trx);

    await sql`
      CREATE TRIGGER IF NOT EXISTS news_fts_news_au AFTER UPDATE OF authorId, newsKindCode ON news
      WHEN OLD.authorId IS NOT NEW.authorId OR OLD.newsKindCode IS NOT NEW.newsKindCode
      BEGIN
        DELETE FROM news_fts WHERE newsId = NEW.id;
        ${insertNewsFtsRows} WHERE t.newsId = NEW.id;
      END
    `.execute(trx);

    await sql`
      CREATE TRIGGER IF NOT EXISTS news_fts_member_au AFTER UPDATE OF firstName, lastName, maternalName ON member
      WHEN OLD.firstName IS NOT NEW.firstName
        OR OLD.lastName IS NOT NEW.lastName
        OR OLD.maternalName IS NOT NEW.maternalName
      BEGIN
        DELETE FROM news_fts WHERE newsId IN (SELECT id FROM news WHERE authorId = NEW.id);
        ${insertNewsFtsRows} WHERE n.authorId = NEW.id;
      END
    `.execute(trx);

    await sql`
      CREATE TRIGGER IF NOT EXISTS news_fts_news_kind_translation_au
      AFTER UPDATE OF newsKindCode, locale, name ON news_kind_translation BEGIN
        DELETE FROM news_fts
        WHERE locale IN (OLD.locale, NEW.locale)
          AND newsId IN (SELECT id FROM news WHERE newsKindCode IN (OLD.newsKindCode, NEW.newsKindCode));
        ${insertNewsFtsRows}
        WHERE t.locale IN (OLD.locale, NEW.locale) AND n.newsKindCode IN (OLD.newsKindCode, NEW.newsKindCode);
      END
    `.execute(trx);

    if (existing.rows.length === 0) await insertNewsFtsRows.execute(trx);
  });
}
