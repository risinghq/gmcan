import { inject } from "@angular/core";
import type { ResolveFn } from "@angular/router";
import { SessionService } from "@app/shared/services/session.service";

type PageName =
  | "notFound"
  | "errorTitle"
  | "members"
  | "projects"
  | "publications"
  | "news"
  | "join"
  | "who"
  | "linesInvestigation"
  | "methods"
  | "resources"
  | "futureWorks";

export function pageTitle(page: PageName): ResolveFn<string> {
  return () => inject(SessionService).language()[page];
}
