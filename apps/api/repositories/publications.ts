import { db, queryInChunks } from "../db/client.js";
import type { Locale } from "../lib/public-locale.js";

export async function searchPublicationRows(locale: Locale, like: string) {
  return db
    .selectFrom("publication")
    .innerJoin("publication_translation", (join) =>
      join
        .onRef("publication_translation.publicationId", "=", "publication.id")
        .on("publication_translation.locale", "=", locale),
    )
    .select([
      "publication.id",
      "publication.kindCode",
      "publication.doi",
      "publication.publishedAt",
      "publication_translation.title as title",
      "publication_translation.abstract as abstract",
    ])
    .where((eb) =>
      eb.or([eb("publication_translation.title", "like", like), eb("publication_translation.abstract", "like", like)]),
    )
    .execute();
}

export async function listPublicationAuthorRowsByPublicationIds(publicationIds: number[]) {
  return queryInChunks(publicationIds, (chunk) =>
    db
      .selectFrom("publication_author")
      .leftJoin("member", "member.id", "publication_author.memberId")
      .select([
        "publication_author.publicationId",
        "publication_author.authorOrder",
        "publication_author.externalName",
        "publication_author.memberId",
        "member.firstName as memberFirstName",
        "member.lastName as memberLastName",
        "member.maternalName as memberMaternalName",
      ])
      .where("publication_author.publicationId", "in", chunk)
      .orderBy("publication_author.publicationId", "asc")
      .orderBy("publication_author.authorOrder", "asc")
      .execute(),
  );
}
