type NamedPerson = { firstName: string; lastName: string; maternalName?: string | null };

export function personName(person: NamedPerson): string {
  return [person.firstName, person.lastName, person.maternalName].filter(Boolean).join(" ");
}
