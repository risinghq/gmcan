import type { AboutTranslation } from "@gmcan/contracts/admin";

/** `GET /api/group/:id/about` items: the about page in the request's locale. */
export interface About extends AboutTranslation {
  id: number;
  asset: string | null;
  groupId: number;
  createdAt: string | null;
  updatedAt: string | null;
}
