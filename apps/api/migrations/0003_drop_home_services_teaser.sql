PRAGMA defer_foreign_keys = true;

CREATE TABLE "about_translation_new" ("aboutId" integer not null references "about" ("id") on delete cascade, "locale" text not null references "locale" ("code") on delete restrict, "description" text not null, "objectivesContent" text not null, "servicesContent" text not null, constraint "about_translation_objectives_json_valid" check (json_valid(objectivesContent)), constraint "about_translation_services_json_valid" check (json_valid(servicesContent)), constraint "about_translation_pk" primary key ("aboutId", "locale"));

INSERT INTO "about_translation_new" ("aboutId", "locale", "description", "objectivesContent", "servicesContent")
SELECT "aboutId", "locale", "description", "objectivesContent", "servicesContent" FROM "about_translation";

DROP TABLE "about_translation";

ALTER TABLE "about_translation_new" RENAME TO "about_translation";
