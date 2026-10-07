CREATE TABLE "locale" ("code" text not null primary key);

CREATE TABLE "gender" ("code" text not null primary key, "name" text not null, constraint "gender_code_check" check (code in ('male','female')));

CREATE TABLE "prefix" ("code" text not null primary key, "label" text not null, constraint "prefix_code_check" check (code in ('dr','dra','mg','lic','bach','ing','none')));

CREATE TABLE "role" ("code" text not null primary key, "name" text not null, constraint "role_code_check" check (code in ('administrator','researcher','visitor')));

CREATE TABLE "member_type" ("code" text not null primary key, constraint "member_type_code_check" check (code in ('researcher','phd_student','master_student','undergraduate_student','collaborator')));

CREATE TABLE "member_type_translation" ("memberTypeCode" text not null references "member_type" ("code") on delete cascade, "locale" text not null references "locale" ("code") on delete restrict, "name" text not null, "nameSingular" text not null, constraint "member_type_translation_pk" primary key ("memberTypeCode", "locale"));

CREATE TABLE "publication_kind" ("code" text not null primary key, constraint "publication_kind_code_check" check (code in ('journal_article','conference_paper','thesis')));

CREATE TABLE "publication_kind_translation" ("publicationKindCode" text not null references "publication_kind" ("code") on delete cascade, "locale" text not null references "locale" ("code") on delete restrict, "name" text not null, constraint "publication_kind_translation_pk" primary key ("publicationKindCode", "locale"));

CREATE TABLE "thesis_kind" ("code" text not null primary key, constraint "thesis_kind_code_check" check (code in ('phd','masters')));

CREATE TABLE "thesis_kind_translation" ("thesisKindCode" text not null references "thesis_kind" ("code") on delete cascade, "locale" text not null references "locale" ("code") on delete restrict, "name" text not null, constraint "thesis_kind_translation_pk" primary key ("thesisKindCode", "locale"));

CREATE TABLE "news_kind" ("code" text not null primary key, constraint "news_kind_code_check" check (code in ('general','research','event')));

CREATE TABLE "news_kind_translation" ("newsKindCode" text not null references "news_kind" ("code") on delete cascade, "locale" text not null references "locale" ("code") on delete restrict, "name" text not null, constraint "news_kind_translation_pk" primary key ("newsKindCode", "locale"));

CREATE TABLE "currency" ("code" text not null primary key, "symbol" text not null, constraint "currency_code_check" check (code in ('pen','usd')));

CREATE TABLE "funding_source" ("code" text not null primary key, "name" text not null, constraint "funding_source_code_check" check (code in ('vrip','none')));

CREATE TABLE "journal" ("id" integer not null primary key autoincrement, "name" text not null unique);

CREATE TABLE "university" ("id" integer not null primary key autoincrement);

CREATE TABLE "university_translation" ("universityId" integer not null references "university" ("id") on delete cascade, "locale" text not null references "locale" ("code") on delete restrict, "name" text not null, constraint "university_translation_pk" primary key ("universityId", "locale"));

CREATE TABLE "event" ("id" integer not null primary key autoincrement);

CREATE TABLE "event_translation" ("eventId" integer not null references "event" ("id") on delete cascade, "locale" text not null references "locale" ("code") on delete restrict, "name" text not null, "city" text, "country" text, constraint "event_translation_pk" primary key ("eventId", "locale"));

CREATE TABLE "research_group" ("id" integer not null primary key autoincrement, "slug" text not null unique, "shortName" text not null, "fullName" text not null, "address" text, "email" text, "phone" text, "createdAt" text not null, "updatedAt" text not null);

CREATE TABLE "research_group_translation" ("groupId" integer not null references "research_group" ("id") on delete cascade, "locale" text not null references "locale" ("code") on delete restrict, "summary" text not null, "facilities" text, "futureWork" text, "publicationsSection" text, "projectsSection" text, constraint "research_group_translation_pk" primary key ("groupId", "locale"));

CREATE TABLE "member" ("id" integer not null primary key autoincrement, "dni" text not null unique, "email" text not null unique, "passwordHash" text not null, "firstName" text not null, "lastName" text not null, "maternalName" text, "birthDate" text, "isActive" integer not null, "roleCode" text not null references "role" ("code"), "memberTypeCode" text not null references "member_type" ("code"), "prefixCode" text references "prefix" ("code"), "genderCode" text references "gender" ("code"), "createdAt" text not null, "updatedAt" text not null, constraint "member_is_active_check" check (isActive in (0,1)));

CREATE TABLE "member_translation" ("memberId" integer not null references "member" ("id") on delete cascade, "locale" text not null references "locale" ("code") on delete restrict, "bio" text, constraint "member_translation_pk" primary key ("memberId", "locale"));

CREATE TABLE "session" ("id" text not null primary key, "memberId" integer not null references "member" ("id") on delete cascade, "expiresAt" text not null, "lastActiveAt" text not null);

CREATE TABLE "password_reset" ("tokenHash" text not null primary key, "memberId" integer not null unique references "member" ("id") on delete cascade, "expiresAt" text not null);

CREATE TABLE "research_line" ("id" integer not null primary key autoincrement, "groupId" integer not null references "research_group" ("id") on delete cascade, "createdAt" text not null, "updatedAt" text not null);

CREATE TABLE "research_line_translation" ("researchLineId" integer not null references "research_line" ("id") on delete cascade, "locale" text not null references "locale" ("code") on delete restrict, "name" text not null, "description" text, constraint "research_line_translation_pk" primary key ("researchLineId", "locale"));

CREATE TABLE "method" ("id" integer not null primary key autoincrement, "groupId" integer not null references "research_group" ("id") on delete cascade, "createdAt" text not null, "updatedAt" text not null);

CREATE TABLE "method_translation" ("methodId" integer not null references "method" ("id") on delete cascade, "locale" text not null references "locale" ("code") on delete restrict, "name" text not null, "description" text, constraint "method_translation_pk" primary key ("methodId", "locale"));

CREATE TABLE "equipment" ("id" integer not null primary key autoincrement, "groupId" integer not null references "research_group" ("id") on delete cascade, "name" text not null, "cpu" text, "gpu" text, "ram" text, "storage" text, "createdAt" text not null, "updatedAt" text not null);

CREATE TABLE "software" ("id" integer not null primary key autoincrement, "groupId" integer not null references "research_group" ("id") on delete cascade, "moreInfo" text, "createdAt" text not null, "updatedAt" text not null);

CREATE TABLE "software_translation" ("softwareId" integer not null references "software" ("id") on delete cascade, "locale" text not null references "locale" ("code") on delete restrict, "name" text not null, "description" text, constraint "software_translation_pk" primary key ("softwareId", "locale"));

CREATE TABLE "about" ("id" integer not null primary key autoincrement, "groupId" integer not null references "research_group" ("id") on delete cascade, "createdAt" text not null, "updatedAt" text not null);

CREATE TABLE "about_translation" ("aboutId" integer not null references "about" ("id") on delete cascade, "locale" text not null references "locale" ("code") on delete restrict, "description" text not null, "objectivesContent" text not null, "servicesContent" text not null, "homeServicesTeaserContent" text not null, constraint "about_translation_objectives_json_valid" check (json_valid(objectivesContent)), constraint "about_translation_services_json_valid" check (json_valid(servicesContent)), constraint "about_translation_teaser_json_valid" check (json_valid(homeServicesTeaserContent)), constraint "about_translation_pk" primary key ("aboutId", "locale"));

CREATE TABLE "news" ("id" integer not null primary key autoincrement, "statusCode" text not null, "publishedAt" text not null, "priority" integer, "authorId" integer not null references "member" ("id") on delete restrict, "newsKindCode" text not null references "news_kind" ("code"), "createdAt" text not null, "updatedAt" text not null, constraint "news_status_code_check" check (statusCode in ('draft','published','archived')));

CREATE TABLE "news_translation" ("newsId" integer not null references "news" ("id") on delete cascade, "locale" text not null references "locale" ("code") on delete restrict, "title" text not null, "summary" text not null, "body" text not null, constraint "news_translation_pk" primary key ("newsId", "locale"));

CREATE TABLE "publication" ("id" integer not null primary key autoincrement, "kindCode" text not null references "publication_kind" ("code"), "doi" text, "publishedAt" text not null, "createdAt" text not null, "updatedAt" text not null);

CREATE TABLE "publication_translation" ("publicationId" integer not null references "publication" ("id") on delete cascade, "locale" text not null references "locale" ("code") on delete restrict, "title" text not null, "abstract" text, constraint "publication_translation_pk" primary key ("publicationId", "locale"));

CREATE TABLE "journal_article" ("publicationId" integer not null primary key references "publication" ("id") on delete cascade, "journalId" integer references "journal" ("id") on delete restrict, "issue" integer);

CREATE TABLE "conference_paper" ("publicationId" integer not null primary key references "publication" ("id") on delete cascade, "eventId" integer not null references "event" ("id") on delete restrict);

CREATE TABLE "thesis" ("publicationId" integer not null primary key references "publication" ("id") on delete cascade, "universityId" integer not null references "university" ("id") on delete restrict, "thesisKindCode" text not null references "thesis_kind" ("code"));

CREATE TABLE "publication_author" ("publicationId" integer not null references "publication" ("id") on delete cascade, "authorOrder" integer not null, "memberId" integer references "member" ("id") on delete set null, "externalName" text, constraint "publication_author_pk" primary key ("publicationId", "authorOrder"), constraint "publication_author_order_check" check (authorOrder > 0), constraint "publication_author_identity_check" check (((memberId is not null and externalName is null) or (memberId is null and externalName is not null and length(trim(externalName)) > 0))));

CREATE TABLE "project" ("id" integer not null primary key autoincrement, "code" text not null unique, "fundedAmountMinor" integer default 0 not null, "statusCode" text not null, "startDate" text not null, "endDate" text, "researchLineId" integer not null references "research_line" ("id") on delete restrict, "currencyCode" text not null references "currency" ("code"), "fundingSourceCode" text not null references "funding_source" ("code"), "createdAt" text not null, "updatedAt" text not null, constraint "project_funded_amount_minor_check" check (fundedAmountMinor >= 0), constraint "project_status_code_check" check (statusCode in ('planned','active','completed','archived')));

CREATE TABLE "project_translation" ("projectId" integer not null references "project" ("id") on delete cascade, "locale" text not null references "locale" ("code") on delete restrict, "title" text not null, "description" text not null, constraint "project_translation_pk" primary key ("projectId", "locale"));

CREATE TABLE "project_member" ("projectId" integer not null references "project" ("id") on delete cascade, "memberId" integer not null references "member" ("id") on delete cascade, "createdAt" text not null, "updatedAt" text not null, constraint "project_member_pk" primary key ("projectId", "memberId"));

CREATE TABLE "member_group" ("memberId" integer not null references "member" ("id") on delete cascade, "groupId" integer not null references "research_group" ("id") on delete cascade, "createdAt" text not null, "updatedAt" text not null, constraint "member_group_pk" primary key ("memberId", "groupId"));

CREATE TABLE "asset" ("id" integer not null primary key autoincrement, "storageKey" text not null unique, "bucket" text not null, "mimeDetected" text not null, "ext" text not null, "sizeBytes" integer not null, "sha256" text not null, "visibility" text not null, "lifecycleStatus" text not null, "createdBy" integer references "member" ("id") on delete set null, "createdAt" text not null, "deletedAt" text, constraint "asset_size_bytes_check" check (sizeBytes >= 0), constraint "asset_visibility_check" check (visibility in ('public','private')), constraint "asset_lifecycle_status_check" check (lifecycleStatus in ('active','soft_deleted')));

CREATE TABLE "asset_audit" ("id" integer not null primary key autoincrement, "assetId" integer references "asset" ("id") on delete set null, "action" text not null, "actorId" integer references "member" ("id") on delete set null, "reason" text, "createdAt" text not null);

CREATE TABLE "member_asset" ("memberId" integer not null references "member" ("id") on delete cascade, "slot" text not null, "version" integer not null, "assetId" integer not null references "asset" ("id") on delete restrict, "actorId" integer references "member" ("id") on delete set null, "reason" text, "createdAt" text not null, constraint "member_asset_pk" primary key ("memberId", "slot", "version"), constraint "member_asset_slot_check" check (slot = 'photo'), constraint "member_asset_version_check" check (version > 0));

CREATE TABLE "news_asset" ("newsId" integer not null references "news" ("id") on delete cascade, "slot" text not null, "version" integer not null, "assetId" integer not null references "asset" ("id") on delete restrict, "actorId" integer references "member" ("id") on delete set null, "reason" text, "createdAt" text not null, constraint "news_asset_pk" primary key ("newsId", "slot", "version"), constraint "news_asset_slot_check" check (slot = 'photo'), constraint "news_asset_version_check" check (version > 0));

CREATE TABLE "method_asset" ("methodId" integer not null references "method" ("id") on delete cascade, "slot" text not null, "version" integer not null, "assetId" integer not null references "asset" ("id") on delete restrict, "actorId" integer references "member" ("id") on delete set null, "reason" text, "createdAt" text not null, constraint "method_asset_pk" primary key ("methodId", "slot", "version"), constraint "method_asset_slot_check" check (slot = 'photo'), constraint "method_asset_version_check" check (version > 0));

CREATE TABLE "research_line_asset" ("researchLineId" integer not null references "research_line" ("id") on delete cascade, "slot" text not null, "version" integer not null, "assetId" integer not null references "asset" ("id") on delete restrict, "actorId" integer references "member" ("id") on delete set null, "reason" text, "createdAt" text not null, constraint "research_line_asset_pk" primary key ("researchLineId", "slot", "version"), constraint "research_line_asset_slot_check" check (slot = 'photo'), constraint "research_line_asset_version_check" check (version > 0));

CREATE TABLE "publication_asset" ("publicationId" integer not null references "publication" ("id") on delete cascade, "slot" text not null, "version" integer not null, "assetId" integer not null references "asset" ("id") on delete restrict, "actorId" integer references "member" ("id") on delete set null, "reason" text, "createdAt" text not null, constraint "publication_asset_pk" primary key ("publicationId", "slot", "version"), constraint "publication_asset_slot_check" check (slot = 'file'), constraint "publication_asset_version_check" check (version > 0));

CREATE TABLE "research_group_asset" ("groupId" integer not null references "research_group" ("id") on delete cascade, "slot" text not null, "version" integer not null, "assetId" integer not null references "asset" ("id") on delete restrict, "actorId" integer references "member" ("id") on delete set null, "reason" text, "createdAt" text not null, constraint "research_group_asset_pk" primary key ("groupId", "slot", "version"), constraint "research_group_asset_slot_check" check (slot in ('facilities','header','footer')), constraint "research_group_asset_version_check" check (version > 0));

CREATE TABLE "about_asset" ("aboutId" integer not null references "about" ("id") on delete cascade, "slot" text not null, "version" integer not null, "assetId" integer not null references "asset" ("id") on delete restrict, "actorId" integer references "member" ("id") on delete set null, "reason" text, "createdAt" text not null, constraint "about_asset_pk" primary key ("aboutId", "slot", "version"), constraint "about_asset_slot_check" check (slot = 'photo'), constraint "about_asset_version_check" check (version > 0));

CREATE VIRTUAL TABLE news_fts USING fts5(
        title,
        summary,
        authorName,
        kindName,
        newsId UNINDEXED,
        locale UNINDEXED,
        tokenize = 'unicode61 remove_diacritics 2'
      );

CREATE INDEX "idx_member_active_type" on "member" ("isActive", "memberTypeCode");

CREATE INDEX "idx_news_status_published" on "news" ("statusCode", "publishedAt");

CREATE INDEX "idx_news_kind_published" on "news" ("newsKindCode", "publishedAt");

CREATE INDEX "idx_project_status_start" on "project" ("statusCode", "startDate");

CREATE INDEX "idx_publication_kind_published" on "publication" ("kindCode", "publishedAt");

CREATE INDEX "idx_publication_author_member" on "publication_author" ("memberId");

CREATE TRIGGER news_translation_fts_ai AFTER INSERT ON news_translation BEGIN
        
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
 WHERE t.newsId = NEW.newsId AND t.locale = NEW.locale;
      END;

CREATE TRIGGER news_translation_fts_au
      AFTER UPDATE OF newsId, locale, title, summary ON news_translation BEGIN
        DELETE FROM news_fts WHERE newsId = OLD.newsId AND locale = OLD.locale;
        
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
 WHERE t.newsId = NEW.newsId AND t.locale = NEW.locale;
      END;

CREATE TRIGGER news_translation_fts_ad AFTER DELETE ON news_translation BEGIN
        DELETE FROM news_fts WHERE newsId = OLD.newsId AND locale = OLD.locale;
      END;

CREATE TRIGGER news_fts_news_au AFTER UPDATE OF authorId, newsKindCode ON news
      WHEN OLD.authorId IS NOT NEW.authorId OR OLD.newsKindCode IS NOT NEW.newsKindCode
      BEGIN
        DELETE FROM news_fts WHERE newsId = NEW.id;
        
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
 WHERE t.newsId = NEW.id;
      END;

CREATE TRIGGER news_fts_member_au AFTER UPDATE OF firstName, lastName, maternalName ON member
      WHEN OLD.firstName IS NOT NEW.firstName
        OR OLD.lastName IS NOT NEW.lastName
        OR OLD.maternalName IS NOT NEW.maternalName
      BEGIN
        DELETE FROM news_fts WHERE newsId IN (SELECT id FROM news WHERE authorId = NEW.id);
        
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
 WHERE n.authorId = NEW.id;
      END;

CREATE TRIGGER news_fts_news_kind_translation_au
      AFTER UPDATE OF newsKindCode, locale, name ON news_kind_translation BEGIN
        DELETE FROM news_fts
        WHERE locale IN (OLD.locale, NEW.locale)
          AND newsId IN (SELECT id FROM news WHERE newsKindCode IN (OLD.newsKindCode, NEW.newsKindCode));
        
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

        WHERE t.locale IN (OLD.locale, NEW.locale) AND n.newsKindCode IN (OLD.newsKindCode, NEW.newsKindCode);
      END;
