import { randomBytes, scrypt, timingSafeEqual } from "node:crypto";

// OWASP's scrypt parameters for a 16 MiB working set.
const COST = { N: 2 ** 14, r: 8, p: 5 };
const KEY_LENGTH = 32;
const PREFIX = "scrypt";

function derive(password: string, salt: Buffer, params: { N: number; r: number; p: number }): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    scrypt(password, salt, KEY_LENGTH, { ...params, maxmem: 128 * params.N * params.r * 2 }, (error, key) =>
      error ? reject(error) : resolve(key),
    );
  });
}

/** Returns `scrypt$N$r$p$salt$key`, with the salt and key in base64url. */
export async function hashPassword(password: string): Promise<string> {
  const salt = randomBytes(16);
  const key = await derive(password, salt, COST);
  return [PREFIX, COST.N, COST.r, COST.p, salt.toString("base64url"), key.toString("base64url")].join("$");
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  const [prefix, n, r, p, salt, key] = hash.split("$");
  if (prefix !== PREFIX || !salt || !key) return false;
  const expected = Buffer.from(key, "base64url");
  const actual = await derive(password, Buffer.from(salt, "base64url"), { N: Number(n), r: Number(r), p: Number(p) });
  return actual.length === expected.length && timingSafeEqual(actual, expected);
}
