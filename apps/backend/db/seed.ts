import { auditAndQuarantineOrphans, seedAssetsAndBindings } from "./seed/assets.js";
import { seedNews, seedJournals, seedUniversities, seedEvents, seedProject, seedPublications } from "./seed/content.js";
import { seedEquipment, seedSoftware, seedAbout } from "./seed/infrastructure.js";
import { seedLookups } from "./seed/lookups.js";
import { seedMembers } from "./seed/members.js";
import { seedResearchGroup, seedResearchLines, seedMethods } from "./seed/research.js";

export async function seed() {
  await seedLookups();
  await seedResearchGroup();
  await seedResearchLines();
  await seedMethods();
  await seedEquipment();
  await seedSoftware();
  await seedAbout();
  await seedMembers();
  await seedNews();
  await seedJournals();
  await seedUniversities();
  await seedEvents();
  await seedProject();
  await seedPublications();
  await seedAssetsAndBindings();
  await auditAndQuarantineOrphans();
}
