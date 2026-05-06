export interface LookupData {
  memberTypes: { id: number; name: string; nameSingular: string }[];
  publicationTypes: { id: number; name: string }[];
  thesisTypes: { id: number; name: string }[];
  newsTypes: { id: number; name: string }[];
  fundingSources: { id: number; name: string }[];
  universities: { id: number; name: string }[];
  journals: { id: number; name: string }[];
  events: { id: number; name: string; city: string | null; country: string | null }[];
  locales: { supported: string[]; default: string };
}
