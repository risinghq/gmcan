# Localization

The API serves content in the locales listed in `SUPPORTED_LOCALES`, `es` and
`en` by default ([configuration](configuration.md)). Text that varies by locale
is stored per locale; everything else is stored once.

## Choosing the locale of a response

[`middleware/public-locale.ts`](../apps/api/middleware/public-locale.ts) runs on
every `/api` path except `/api/email/*`, and on `/admin/*`. That includes the
asset and placeholder image endpoints, which return the same bytes in every
locale and only carry the header. It reads `Accept-Language`,
keeps the language part of each entry (`en-US` becomes `en`), and takes the
first entry in header order that is supported. It ignores `q` weights. With no
supported entry it uses `DEFAULT_LOCALE`.

The response states the choice:

```console
$ curl -si -H 'Accept-Language: en-US,es;q=0.8' http://localhost:3000/api/news | grep -i '^content-language\|^vary'
content-language: en
vary: Accept-Language, Origin
```

Services pick the matching `<table>_translation` rows for that locale, for
example `news_translation` and `member_translation`.

The web app sends `Accept-Language: en` or `es` on every public API request,
following the language the visitor selected
([`token.interceptor.ts`](../apps/web/src/app/token.interceptor.ts)).

## Writing localized content

Admin endpoints that create or update localized records take a `translations`
object keyed by locale code. It must hold every supported locale and no other
key, or the request fails validation with `Missing translations.<locale>` or
`Unsupported locale key: <key>`
([`lib/admin-translations.ts`](../apps/api/lib/admin-translations.ts)).

```json
{
  "statusCode": "draft",
  "authorId": 1,
  "newsKindCode": "general",
  "translations": {
    "es": { "title": "…", "summary": "…", "body": "…" },
    "en": { "title": "…", "summary": "…", "body": "…" }
  }
}
```

Routes that take a locale in the URL, such as
`PUT /admin/members/:id/translations/:locale`, accept only supported codes.

## Add a locale

1. Add its code to `SUPPORTED_LOCALES`. The `locale` table is filled from that
   list at startup.
2. Write translation rows for it. Admin writes now require them, and existing
   rows have none.
3. The web app's languages and interface strings are in
   [`shared/models/languages.ts`](../apps/web/src/app/shared/models/languages.ts);
   add an entry there to let visitors choose it.

Lookup values such as news kinds and member types have their own translation
tables, filled by the seed
([`db/seed/lookups.ts`](../apps/api/db/seed/lookups.ts)).
