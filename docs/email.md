# Email

```sh
cd apps/api
bunx wrangler secret put RESEND_API_KEY
```

The API sends the contact form and password reset links through
[Resend](https://resend.com) ([`lib/mail.ts`](../apps/api/lib/mail.ts)). It
needs `RESEND_API_KEY` and `EMAIL_FROM`. The contact form also needs
`INSTITUTIONAL_EMAIL` ([configuration](configuration.md#variables)).

When one is missing, `POST /api/email/contact` and
`POST /api/email/password-reset/request` answer 503 and change nothing:

```json
{
  "ok": false,
  "error": {
    "code": "upstream_failure",
    "status": 503,
    "message": "Email is not configured",
    "traceId": "…"
  }
}
```

The password reset request refuses before it looks up the address, so the answer
does not reveal which addresses are registered.

## Turn email on

`EMAIL_FROM` is `onboarding@resend.dev` in
[`apps/api/wrangler.jsonc`](../apps/api/wrangler.jsonc), Resend's shared test
sender. It delivers only to the address of the Resend account owner.

1. Create an API key in the Resend dashboard (API Keys) and set it as the
   `RESEND_API_KEY` secret, as above.
2. Set `INSTITUTIONAL_EMAIL`, the address that receives membership requests, to
   the Resend account owner's address under `vars` in `wrangler.jsonc`.
3. Deploy the API ([deploy](deploy.md)).

## Send to any address

1. Verify a domain in Resend (Domains, then add the DNS records it shows).
2. Set `EMAIL_FROM` to an address on that domain in `wrangler.jsonc`.
3. Deploy the API.
