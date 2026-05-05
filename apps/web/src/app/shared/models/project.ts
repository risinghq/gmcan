export interface Project {
  id: number;
  title: string;
  code: string;
  fundedAmount: string;
  description: string;
  status: number | null;
  startDate: string;
  endDate: string | null;
  researchLineId: number;
  currencyId: number;
  fundingSourceId: number;
  createdAt: string | null;
  updatedAt: string | null;
}

export interface ProjectWithMembers extends Project {
  members: { memberId: number; name: string; asset: string | null }[];
  researchLine: string;
  fundingSource: string;
}
