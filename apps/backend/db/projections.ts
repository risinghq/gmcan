import type { SelectExpression } from "kysely";

import type { Database } from "./schema.js";

// Public user fields
// Both resumenPro and resumenProEN returned so the frontend can pick per locale.
export const USUARIO_PUBLIC = [
  "DNI",
  "correo",
  "nombre",
  "apellidoPaterno",
  "apellidoMaterno",
  "fechaNacimiento",
  "resumenPro",
  "resumenProEN",
  "foto",
  "estado",
  "tipoUsuario_idTipoUsuario",
  "tipoMiembro_idTipoMiembro",
  "prefijo_idPrefijo",
] as const satisfies ReadonlyArray<SelectExpression<Database, "usuario">>;

export const USUARIO_NAME = [
  "DNI",
  "nombre",
  "apellidoPaterno",
  "apellidoMaterno",
  "foto",
] as const satisfies ReadonlyArray<SelectExpression<Database, "usuario">>;

export const USUARIO_ACTIVE = [
  "DNI",
  "nombre",
  "apellidoPaterno",
  "apellidoMaterno",
  "correo",
  "foto",
  "tipoMiembro_idTipoMiembro",
  "prefijo_idPrefijo",
] as const satisfies ReadonlyArray<SelectExpression<Database, "usuario">>;
