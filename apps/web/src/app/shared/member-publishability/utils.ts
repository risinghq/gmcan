import type { MemberPublishability } from "../models/member";

const REQUIREMENT_LABELS: Record<string, string> = {
  member: "Miembro inexistente",
  dni: "DNI",
  email: "Correo",
  firstName: "Nombres",
  lastName: "Apellido paterno",
  isActive: "Miembro activo",
  roleCode: "Las cuentas de administrador no se publican",
};

export function countMissingRequirements(publishability: MemberPublishability): number {
  return publishability.missing.length;
}

export function publishabilityTooltip(publishability: MemberPublishability | null): string {
  if (!publishability) return "Estado de publicación no disponible";
  if (publishability.publishable) return "Listo para mostrarse en público";
  return `Borrador: ${countMissingRequirements(publishability)} requisito(s) pendiente(s)`;
}

export function publishabilityMissingItems(publishability: MemberPublishability): string[] {
  return publishability.missing.map((field) => REQUIREMENT_LABELS[field] ?? field);
}
