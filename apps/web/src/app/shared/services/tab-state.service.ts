import { Injectable, signal } from "@angular/core";

/**
 * Holds active tab indices for all dashboard list views.
 * Signals keep this reactive and in-memory.
 * State resets on full page refresh, which is the expected behaviour.
 */
@Injectable({ providedIn: "root" })
export class TabStateService {
  readonly newsTab = signal(0);
  readonly resumenTab = signal(0);
  readonly projectTab = signal(0);
  readonly contenidosTab = signal(0);
  readonly articleTab = signal(0);
  readonly thesisTab = signal(0);
}
