import type { EmailBody } from "./emailBody";
import { createGroup, type Group } from "./group";

export { createGroup };
export type { Group };

export function createEmailBody(): EmailBody {
  return {
    nombre: "",
    razon: "",
    correo: "",
    telefono: "",
  };
}
