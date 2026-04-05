import type { Proyecto } from "@app/shared/models/proyecto";

export type ProjectsViewModel = {
  proyectos: Proyecto[];
  infoText: string;
};
