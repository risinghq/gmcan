import type { PublicProject } from "@gmcan/contracts/public";

export type ProjectsViewModel = {
  active: PublicProject[];
  finished: PublicProject[];
  infoText: string;
};
