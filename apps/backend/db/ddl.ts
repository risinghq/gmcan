import type { Kysely } from "kysely";

import type { Database } from "./schema.js";

export const EXPECTED_COLUMNS: Record<string, readonly string[]> = {
  gender: ["id", "name", "createdAt", "updatedAt"],
  prefix: ["id", "name", "createdAt", "updatedAt"],
  role: ["id", "name", "createdAt", "updatedAt"],
  member_type: ["id", "name", "nameEN", "nameSingular", "nameSingularEN", "createdAt", "updatedAt"],
  publication_type: ["id", "name", "nameEN", "createdAt", "updatedAt"],
  thesis_type: ["id", "name", "nameEN", "createdAt", "updatedAt"],
  news_type: ["id", "name", "nameEN", "createdAt", "updatedAt"],
  journal: ["id", "name"],
  university: ["id", "name", "nameEN", "createdAt", "updatedAt"],
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
    "facilitiesPhoto",
    "facilitiesES",
    "facilitiesEN",
    "futureWorkES",
    "futureWorkEN",
    "logoFooter",
    "logoHeader",
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
    "photo",
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
  research_line: ["id", "name", "nameEN", "description", "descriptionEN", "photo", "groupId", "createdAt", "updatedAt"],
  method: ["id", "name", "nameEN", "description", "descriptionEN", "photo", "groupId", "createdAt", "updatedAt"],
  equipment: ["id", "name", "cpu", "gpu", "ram", "storage", "groupId", "createdAt", "updatedAt"],
  software: ["id", "name", "description", "descriptionEN", "moreInfo", "groupId", "createdAt", "updatedAt"],
  about: [
    "id",
    "descriptionES",
    "descriptionEN",
    "objectivesES",
    "objectivesEN",
    "servicesES",
    "servicesEN",
    "createdAt",
    "updatedAt",
    "photo",
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
    "photo",
    "priority",
    "authorId",
    "newsTypeId",
  ],
  publication: [
    "id",
    "title",
    "file",
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
};

export async function createTables(db: Kysely<Database>) {
  await db.schema
    .createTable("gender")
    .ifNotExists()
    .addColumn("id", "integer", (c) => c.primaryKey().autoIncrement().notNull())
    .addColumn("name", "text", (c) => c.notNull())
    .addColumn("createdAt", "text")
    .addColumn("updatedAt", "text")
    .execute();

  await db.schema
    .createTable("prefix")
    .ifNotExists()
    .addColumn("id", "integer", (c) => c.primaryKey().autoIncrement().notNull())
    .addColumn("name", "text", (c) => c.notNull())
    .addColumn("createdAt", "text")
    .addColumn("updatedAt", "text")
    .execute();

  await db.schema
    .createTable("role")
    .ifNotExists()
    .addColumn("id", "integer", (c) => c.primaryKey().autoIncrement().notNull())
    .addColumn("name", "text", (c) => c.notNull())
    .addColumn("createdAt", "text")
    .addColumn("updatedAt", "text")
    .execute();

  await db.schema
    .createTable("member_type")
    .ifNotExists()
    .addColumn("id", "integer", (c) => c.primaryKey().autoIncrement().notNull())
    .addColumn("name", "text", (c) => c.notNull())
    .addColumn("nameEN", "text", (c) => c.notNull())
    .addColumn("nameSingular", "text", (c) => c.notNull())
    .addColumn("nameSingularEN", "text", (c) => c.notNull())
    .addColumn("createdAt", "text")
    .addColumn("updatedAt", "text")
    .execute();

  await db.schema
    .createTable("news_type")
    .ifNotExists()
    .addColumn("id", "integer", (c) => c.primaryKey().autoIncrement().notNull())
    .addColumn("name", "text", (c) => c.notNull())
    .addColumn("nameEN", "text", (c) => c.notNull())
    .addColumn("createdAt", "text")
    .addColumn("updatedAt", "text")
    .execute();

  await db.schema
    .createTable("publication_type")
    .ifNotExists()
    .addColumn("id", "integer", (c) => c.primaryKey().autoIncrement().notNull())
    .addColumn("name", "text", (c) => c.notNull())
    .addColumn("nameEN", "text", (c) => c.notNull())
    .addColumn("createdAt", "text", (c) => c.notNull())
    .addColumn("updatedAt", "text", (c) => c.notNull())
    .execute();

  await db.schema
    .createTable("thesis_type")
    .ifNotExists()
    .addColumn("id", "integer", (c) => c.primaryKey().autoIncrement().notNull())
    .addColumn("name", "text", (c) => c.notNull())
    .addColumn("nameEN", "text", (c) => c.notNull())
    .addColumn("createdAt", "text", (c) => c.notNull())
    .addColumn("updatedAt", "text", (c) => c.notNull())
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
    .addColumn("name", "text")
    .addColumn("nameEN", "text")
    .addColumn("createdAt", "text")
    .addColumn("updatedAt", "text")
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
    .addColumn("facilitiesPhoto", "text")
    .addColumn("facilitiesES", "text")
    .addColumn("facilitiesEN", "text")
    .addColumn("futureWorkES", "text")
    .addColumn("futureWorkEN", "text")
    .addColumn("logoFooter", "text")
    .addColumn("logoHeader", "text")
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
    .addColumn("photo", "text")
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
    .addColumn("photo", "text")
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
    .addColumn("photo", "text")
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
    .addColumn("objectivesES", "text")
    .addColumn("objectivesEN", "text")
    .addColumn("servicesES", "text")
    .addColumn("servicesEN", "text")
    .addColumn("createdAt", "text")
    .addColumn("updatedAt", "text")
    .addColumn("photo", "text")
    .addColumn("groupId", "integer", (c) => c.notNull().references("research_group.id"))
    .execute();

  await db.schema
    .createTable("news")
    .ifNotExists()
    .addColumn("id", "integer", (c) => c.primaryKey().autoIncrement().notNull())
    .addColumn("title", "text")
    .addColumn("titleEN", "text")
    .addColumn("summary", "text")
    .addColumn("summaryEN", "text")
    .addColumn("body", "text")
    .addColumn("bodyEN", "text")
    .addColumn("status", "integer")
    .addColumn("publishedAt", "text")
    .addColumn("updatedAt", "text")
    .addColumn("createdAt", "text")
    .addColumn("photo", "text")
    .addColumn("priority", "integer")
    .addColumn("authorId", "integer", (c) => c.references("member.id"))
    .addColumn("newsTypeId", "integer", (c) => c.references("news_type.id"))
    .execute();

  await db.schema
    .createTable("publication")
    .ifNotExists()
    .addColumn("id", "integer", (c) => c.primaryKey().autoIncrement().notNull())
    .addColumn("title", "text", (c) => c.notNull())
    .addColumn("file", "text")
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
}
