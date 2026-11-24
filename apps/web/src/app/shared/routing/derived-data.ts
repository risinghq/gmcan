import type { ActivatedRouteSnapshot, Data } from "@angular/router";

/**
 * A value computed from a route's resolved data once navigation has resolved it.
 * Angular runs a route's resolvers concurrently, so one resolver cannot read
 * another's result; a value that depends on resolved data is a Derive instead.
 */
export type Derive<T> = (data: Data, route: ActivatedRouteSnapshot) => T;

export function deriveFromRoute<T>(route: ActivatedRouteSnapshot, key: string): T | undefined {
  const derive = route.data[key] as Derive<T> | undefined;
  return typeof derive === "function" ? derive(route.data, route) : undefined;
}

export function deepestChild(route: ActivatedRouteSnapshot): ActivatedRouteSnapshot {
  let current = route;
  while (current.firstChild) current = current.firstChild;
  return current;
}

/** The page title: a `pageTitle` Derive in route data wins over the static route title. */
export function routeTitle(route: ActivatedRouteSnapshot): string | undefined {
  return deriveFromRoute<string>(route, "pageTitle") ?? (typeof route.title === "string" ? route.title : undefined);
}
