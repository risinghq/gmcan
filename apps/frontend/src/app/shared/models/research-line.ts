export interface ResearchLine {
  id: number;
  name: string;
  description: string | null;
  photo: string | null;
  photoUrl?: string | null;
  groupId: number;
  createdAt: string | null;
  updatedAt: string | null;
}
