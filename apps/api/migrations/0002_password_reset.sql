CREATE TABLE IF NOT EXISTS "password_reset" (
    "tokenHash" text NOT NULL PRIMARY KEY,
    "memberId" integer NOT NULL UNIQUE REFERENCES "member" ("id") ON DELETE CASCADE,
    "expiresAt" text NOT NULL
);
