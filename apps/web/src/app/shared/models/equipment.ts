export interface Equipment {
  id: number;
  name: string;
  cpu: string | null;
  gpu: string | null;
  ram: string | null;
  storage: string | null;
  groupId: number;
  createdAt: string | null;
  updatedAt: string | null;
}
