const { db } = await import("../../db/client.js");
const { createTables } = await import("../../db/ddl.js");
const { seedLocales, seedLookups } = await import("../../db/seed/lookups.js");
const { seedResearchGroup } = await import("../../db/seed/research.js");
const { seedMembers } = await import("../../db/seed/members.js");
const { verifyPassword } = await import("../../lib/password.js");

await createTables(db);
await seedLocales();
await seedLookups();
await seedResearchGroup();
await seedMembers();

const admin = await db
  .selectFrom("member")
  .select("passwordHash")
  .where("email", "=", "admin@gmcan.dev")
  .executeTakeFirstOrThrow();
const candidates = process.argv.slice(2);
const matches = await Promise.all(candidates.map((candidate) => verifyPassword(candidate, admin.passwordHash)));
console.log(JSON.stringify(candidates.filter((_, i) => matches[i])));

process.exit(0);
