import type { MemberPublishability } from "../models/member";

export type PublishabilityTone = "ready" | "draft" | "hidden";

export interface PublishabilityStatus {
  tone: PublishabilityTone;
  label: string;
  summary: string;
  reasons: string[];
}

const MISSING_DATA: Record<string, string> = {
  dni: "N° DNI / Pasaporte",
  email: "Correo electrónico",
  firstName: "Primer nombre",
  lastName: "Apellido paterno",
};

const HIDDEN_BY: Record<string, string> = {
  member: "El miembro no existe",
  isActive: "Es un miembro antiguo",
  roleCode: "Es una cuenta de administrador",
};

export function publishabilityStatus(publishability: MemberPublishability): PublishabilityStatus {
  if (publishability.publishable) {
    return { tone: "ready", label: "Público", summary: "Se muestra en el sitio público.", reasons: [] };
  }

  const hiddenBy = publishability.missing.filter((field) => field in HIDDEN_BY);
  if (hiddenBy.length > 0) {
    return {
      tone: "hidden",
      label: "Oculto",
      summary: "No se muestra en el sitio público:",
      reasons: hiddenBy.map((field) => HIDDEN_BY[field]),
    };
  }

  const reasons = publishability.missing.map((field) => MISSING_DATA[field] ?? field);
  return {
    tone: "draft",
    label: `Borrador · ${reasons.length}`,
    summary: "Completa estos datos para mostrarlo en el sitio público:",
    reasons,
  };
}
