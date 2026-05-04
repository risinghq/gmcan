export interface About {
  id: number;
  description: string;
  objectives: string | null;
  services: string | null;
  photo: string | null;
  photoUrl?: string | null;
  groupId: number;
  createdAt: string | null;
  updatedAt: string | null;
}
