import { localizeField } from "../../lib/public-locale.js";
import { assetUrl } from "../../lib/upload.js";

type Locale = "es" | "en";

export function toPublicMemberRow<T extends { photo: string | null; bio?: string | null; bioEN?: string | null }>(
  row: T,
  locale: Locale,
) {
  return Object.assign({}, row, {
    bio: localizeField(row, locale, { es: "bio", en: "bioEN", required: false }),
    asset: assetUrl(row.photo),
  });
}

export function toPublicProfilePublication<T extends { file: string | null }>(publication: T) {
  return Object.assign({}, publication, { asset: assetUrl(publication.file) });
}
