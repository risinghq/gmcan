export interface Method {
  id: number;
  name: string;
  nameEN: string;
  description: string;
  descriptionEN: string | null;
  photo: string | null;
  groupId: number;
  createdAt: string | null;
  updatedAt: string | null;
}
