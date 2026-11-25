import { z } from "zod";

/**
 * A write carries one entry per supported locale, keyed by locale. The API checks the keys against
 * its SUPPORTED_LOCALES setting, so the record type stays open here.
 */
export type Translations<T> = Record<string, T>;

export const ResearchLineTranslationSchema = z.object({
  name: z.string().trim().min(1),
  description: z.string().optional(),
});
export type ResearchLineTranslation = z.infer<typeof ResearchLineTranslationSchema>;

export const MethodTranslationSchema = z.object({
  name: z.string().trim().min(1),
  description: z.string().trim().min(1),
});
export type MethodTranslation = z.infer<typeof MethodTranslationSchema>;

export const SoftwareTranslationSchema = z.object({
  name: z.string().trim().min(1),
  description: z.string().optional(),
});
export type SoftwareTranslation = z.infer<typeof SoftwareTranslationSchema>;

export const EquipmentFieldsSchema = z.object({
  name: z.string().trim().min(1),
  cpu: z.string().optional(),
  gpu: z.string().optional(),
  ram: z.string().optional(),
  storage: z.string().optional(),
});
export type EquipmentFields = z.infer<typeof EquipmentFieldsSchema>;

interface AdminContentView<T> {
  id: number;
  groupId: number;
  createdAt: string | null;
  updatedAt: string | null;
  translations: Translations<T>;
}

/** `GET /admin/research-lines` items and `GET /admin/research-lines/:id`. */
export interface AdminResearchLine extends AdminContentView<Required<ResearchLineTranslation>> {
  asset: string | null;
}

/** `GET /admin/methods` items and `GET /admin/methods/:id`. */
export interface AdminMethod extends AdminContentView<MethodTranslation> {
  asset: string | null;
}

/** `GET /admin/group/:groupId/software` items and `GET /admin/group/software/:id`. */
export interface AdminSoftware extends AdminContentView<Required<SoftwareTranslation>> {
  moreInfo: string | null;
}

/** `GET /admin/group/:groupId/equipment` items and `GET /admin/group/equipment/:id`. */
export interface AdminEquipment {
  id: number;
  groupId: number;
  name: string;
  cpu: string | null;
  gpu: string | null;
  ram: string | null;
  storage: string | null;
  createdAt: string | null;
  updatedAt: string | null;
}
