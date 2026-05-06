export interface LookupData {
  memberTypes: { code: string; name: string; nameSingular: string }[];
  publicationKinds: { code: string; name: string }[];
  thesisKinds: { code: string; name: string }[];
  newsKinds: { code: string; name: string }[];
  fundingSources: { code: string; name: string }[];
  currencies: { code: string; symbol: string }[];
  roles: { code: string; name: string }[];
  genders: { code: string; name: string }[];
  prefixes: { code: string; label: string }[];
  universities: { id: number; name: string }[];
  journals: { id: number; name: string }[];
  events: { id: number; name: string; city: string | null; country: string | null }[];
  locales: { supported: string[]; default: string };
}
