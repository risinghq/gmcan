import { z } from "zod";

export const LookupDataSchema = z.object({
  memberTypes: z.array(z.object({ code: z.string(), name: z.string(), nameSingular: z.string() })),
  publicationKinds: z.array(z.object({ code: z.string(), name: z.string() })),
  thesisKinds: z.array(z.object({ code: z.string(), name: z.string() })),
  newsKinds: z.array(z.object({ code: z.string(), name: z.string() })),
  fundingSources: z.array(z.object({ code: z.string(), name: z.string() })),
  currencies: z.array(z.object({ code: z.string(), symbol: z.string() })),
  roles: z.array(z.object({ code: z.string(), name: z.string() })),
  genders: z.array(z.object({ code: z.string(), name: z.string() })),
  prefixes: z.array(z.object({ code: z.string(), label: z.string() })),
  universities: z.array(z.object({ id: z.number(), name: z.string() })),
  journals: z.array(z.object({ id: z.number(), name: z.string() })),
  events: z.array(z.object({ id: z.number(), name: z.string(), city: z.string().nullable(), country: z.string().nullable() })),
  locales: z.object({ supported: z.array(z.string()), default: z.string() }),
});

export type LookupData = z.infer<typeof LookupDataSchema>;
