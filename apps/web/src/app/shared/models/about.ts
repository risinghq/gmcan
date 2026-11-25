import type { AboutTranslation } from "@gmcan/contracts/admin";

export interface About extends AboutTranslation {
  id: number;
  asset: string | null;
  groupId: number;
  createdAt: string | null;
  updatedAt: string | null;
}
