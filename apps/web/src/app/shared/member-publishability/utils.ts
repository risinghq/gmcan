import type { MemberPublishability } from "../models/member";

export function countMissingRequirements(publishability: MemberPublishability): number {
  return (
    publishability.missing.base.length +
    Object.values(publishability.missing.translations).reduce((sum, fields) => sum + fields.length, 0)
  );
}

export function publishabilityTooltip(publishability: MemberPublishability | null): string {
  if (!publishability) return "Estado de publicación no disponible";
  if (publishability.publishable) return "Ready para mostrarse en público";
  return `Borrador: ${countMissingRequirements(publishability)} requisito(s) pendiente(s)`;
}

export function publishabilityMissingItems(publishability: MemberPublishability): string[] {
  const items: string[] = [];
  for (const field of publishability.missing.base) {
    items.push(`Base: ${field}`);
  }
  for (const [locale, fields] of Object.entries(publishability.missing.translations)) {
    for (const field of fields) {
      items.push(`Traducción (${locale}): ${field}`);
    }
  }
  return items;
}
