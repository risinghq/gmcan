import { z } from "zod";

export const IdParam = z.object({ id: z.coerce.number().int().positive() });

export const PublicacionFields = z.object({
  titulo: z.string().min(1),
  resumen: z.string().optional(),
  resumenEN: z.string().optional(),
  DOI: z.string().optional(),
  fechaPublicacion: z.string(),
  nroRevista: z.number().optional(),
  tipoPublicacion_idTipoPublicacion: z.number().int(),
  revista_idRevista: z.number().int().optional(),
  universidad_idUniversidad: z.number().int().optional(),
  tipoTesis_idTipoTesis: z.number().int().optional(),
  evento_idEvento: z.number().int().optional(),
});

export const SaveEntry = z.discriminatedUnion("kind", [
  z.object({ kind: z.literal("registered"), DNI: z.string().min(1), isPrincipal: z.number().int() }),
  z.object({ kind: z.literal("external"), nombre: z.string().min(1), isPrincipal: z.number().int() }),
]);

export const CreateBody = z.object({
  data: PublicacionFields,
  autores: z.array(SaveEntry),
});

export const UpdateBody = z.object({
  data: PublicacionFields,
  autores: z.array(SaveEntry),
});

export const SearchByTipoBody = z.object({
  titulo: z.string(),
  tipoPublicacion_idTipoPublicacion: z.number().int(),
});

export const SearchGlobalBody = z.object({ titulo: z.string() });
