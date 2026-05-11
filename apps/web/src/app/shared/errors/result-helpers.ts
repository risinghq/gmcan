import { ResultAsync, errAsync, okAsync } from "neverthrow";
import type { Observable } from "rxjs";
import { firstValueFrom } from "rxjs";

import { RouteDataError, type NavigationAppError } from "./app-error";

export function fromObservable<T>(factory: () => Observable<T>, message: string): ResultAsync<T, NavigationAppError> {
  return ResultAsync.fromPromise(
    firstValueFrom(factory()),
    (error): NavigationAppError => ({ code: "upstream_failure", message, details: error }),
  );
}

export function failInvariant(message: string, details?: unknown): ResultAsync<never, NavigationAppError> {
  return errAsync({ code: "invariant_violation" as const, message, details });
}

export function invariant(
  condition: boolean,
  message: string,
  details?: unknown,
): ResultAsync<true, NavigationAppError> {
  if (condition) return okAsync(true as const);
  return errAsync({ code: "invariant_violation" as const, message, details });
}

export function unwrapOrThrow<T>(result: ResultAsync<T, NavigationAppError>): Promise<T> {
  return result.match(
    (value) => value,
    (error) => {
      throw new RouteDataError(error);
    },
  );
}
