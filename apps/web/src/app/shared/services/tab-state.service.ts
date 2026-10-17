import { Injectable, signal } from "@angular/core";

@Injectable({ providedIn: "root" })
export class TabStateService {
  readonly newsTab = signal(0);
  readonly resumenTab = signal(0);
  readonly projectTab = signal(0);
  readonly contenidosTab = signal(0);
  readonly articleTab = signal(0);
  readonly thesisTab = signal(0);
}
