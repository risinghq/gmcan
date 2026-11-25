import { Injectable, signal } from "@angular/core";

import type { Capability } from "../models/capabilities";

@Injectable({ providedIn: "root" })
export class AuthzService {
  private readonly capabilities = signal<ReadonlySet<Capability>>(new Set());

  setCapabilities(capabilities: Capability[] | undefined): void {
    this.capabilities.set(new Set(capabilities ?? []));
  }

  /** Reads a signal, so a computed or template that calls it updates when the session changes. */
  can(permission: Capability): boolean {
    return this.capabilities().has(permission);
  }
}
