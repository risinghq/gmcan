import type { ProjectStatusCode } from "@gmcan/contracts/public";

/** A planned or active project is listed under "en ejecución"; a completed or archived one under "concluidos". */
export function isOngoing(statusCode: ProjectStatusCode): boolean {
  return statusCode === "planned" || statusCode === "active";
}

export function projectListPath(statusCode: ProjectStatusCode): string {
  return isOngoing(statusCode) ? "/dashboard/proyectos-ejecucion" : "/dashboard/proyectos-concluidos";
}
