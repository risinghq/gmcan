export interface Project {
  id: number;
  title: string;
  code: string;
  fundedAmountMinor: number;
  description: string;
  statusCode: "planned" | "active" | "completed" | "archived";
  startDate: string;
  endDate: string | null;
  researchLineId: number;
  currencyCode: "pen" | "usd";
  fundingSourceCode: "vrip" | "none";
  createdAt: string | null;
  updatedAt: string | null;
}

export interface ProjectWithMembers extends Project {
  members: { memberId: number; name: string; photoUrl: string | null; photoAlt: string }[];
  researchLine: string;
  fundingSource: string;
  currencySymbol: string;
}
