import { Injectable } from "@angular/core";

import type { Capability } from "../models/capabilities";

@Injectable({ providedIn: "root" })
export class AuthzService {
  private capabilitySet = new Set<Capability>();

  setCapabilities(capabilities: Capability[] | undefined): void {
    this.capabilitySet = new Set(capabilities ?? []);
  }

  can(permission: Capability): boolean {
    return this.capabilitySet.has(permission);
  }
}
