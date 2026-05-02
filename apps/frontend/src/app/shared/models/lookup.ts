export interface LookupData {
  memberTypes: { id: number; name: string; nameEN: string; nameSingular: string; nameSingularEN: string }[];
  publicationTypes: { id: number; name: string; nameEN: string }[];
  thesisTypes: { id: number; name: string; nameEN: string }[];
  newsTypes: { id: number; name: string; nameEN: string }[];
  fundingSources: { id: number; name: string }[];
  universities: { id: number; name: string; nameEN: string }[];
  journals: { id: number; name: string }[];
  events: { id: number; name: string; city: string | null; country: string | null }[];
}
