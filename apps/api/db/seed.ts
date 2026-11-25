import { seedAssetsAndBindings } from "./seed/assets.js";
import {
  seedNews,
  seedJournals,
  seedUniversities,
  seedEvents,
  seedProjects,
  seedPublications,
} from "./seed/content.js";
import { seedEquipment, seedSoftware, seedAbout } from "./seed/infrastructure.js";
import { seedLocales, seedLookups } from "./seed/lookups.js";
import { seedMembers } from "./seed/members.js";
import { seedResearchGroup, seedResearchLines, seedMethods } from "./seed/research.js";

export async function seed() {
  await seedLocales();
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
  await seedProjects();
  await seedPublications();
  await seedAssetsAndBindings();
}
