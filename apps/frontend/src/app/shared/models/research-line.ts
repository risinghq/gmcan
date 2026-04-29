export interface ResearchLine {
  id: number;
  name: string;
  nameEN: string;
  description: string | null;
  descriptionEN: string | null;
  photo: string | null;
  groupId: number;
  createdAt: string | null;
  updatedAt: string | null;
}
