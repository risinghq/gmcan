import { ActivatedRoute } from "@angular/router";

export type ReturnTarget = "articulos" | "tesis" | "eventos" | "my-articles" | "my-thesis" | "my-abstracts";

export function resolveReturnTo(route: ActivatedRoute, allowed: ReturnTarget[], fallback: ReturnTarget): ReturnTarget {
  const value = route.snapshot.queryParamMap.get("returnTo");
  if (value && allowed.includes(value as ReturnTarget)) {
    return value as ReturnTarget;
  }
  return fallback;
}
