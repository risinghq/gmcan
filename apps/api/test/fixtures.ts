import { hashPassword } from "../lib/password.js";

// The production cost spends ~150ms per hash and per login. Verifying reads the cost from the hash,
// so a cheap fixture hash keeps login on the real code path.
const FIXTURE_COST = { N: 2 ** 10, r: 8, p: 1 };
const hashes = new Map<string, Promise<string>>();

/** A stored password hash for a fixture member, made once per password. */
export function storedPasswordHash(password: string): Promise<string> {
  let hash = hashes.get(password);
  if (!hash) {
    hash = hashPassword(password, FIXTURE_COST);
    hashes.set(password, hash);
  }
  return hash;
}
